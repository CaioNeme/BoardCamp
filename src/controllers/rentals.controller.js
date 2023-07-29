import dayjs from "dayjs";
import { db } from "../database/database.connectiuon.js";
import { rentalsSchema } from "../schemas/rentals.schemas.js";

export async function getRentals(req, res) {
  try {
    const result = await db.query(`
    SELECT rentals.*, 
    customers.id AS "customersID", customers.name AS "customersName", 
    games.id AS "gameID", games.name AS "gameName" 
    FROM rentals 
    JOIN customers ON customers.id = rentals."customerId"
    JOIN games ON games.id = rentals."gameId";
  `);
    const rentals = result.rows.map((rent) => {
      const {
        id,
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
        customersID,
        customersName,
        gameID,
        gameName,
      } = rent;

      const customer = { id: customersID, name: customersName };
      const game = { id: gameID, name: gameName };

      return {
        id,
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
        customer,
        game,
      };
    });
    res.send(rentals);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function postRentals(req, res) {
  const { customerId, gameId, daysRented } = req.body;
  const rentDate = dayjs().format("YYYY-MM-DD");
  const returnDate = null;
  const delayFee = null;

  const validation = rentalsSchema.validate(req.body);
  if (validation.error) {
    const errors = validation.error.details.map((details) => details.message);
    return res.status(400).send(errors[0]);
  }

  try {
    const game = await db.query(`SELECT * FROM games WHERE id= '${gameId}'; `);
    if (game.rowCount != 1) {
      return res.status(400).send("Jogo não encontrado!");
    }
    if (game.rows[0].stockTotal === 0) {
      return res.sendStatus(400);
    }

    const customer = await db.query(
      `SELECT * FROM customers WHERE id = '${customerId}'; `
    );
    if (customer.rowCount != 1) {
      return res.status(400).send("Usuário não encontrado!");
    }

    const originalPrice = game.rows[0].pricePerDay * daysRented;

    await db.query(
      `INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee"  ) VALUES ($1, $2, $3, $4 ,$5 ,$6 ,$7);`,
      [
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
      ]
    );
    await db.query(`UPDATE games SET "stockTotal"=$1 WHERE id = $2;`, [
      game.rows[0].stockTotal - 1,
      gameId,
    ]);

    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function postRentalsByIdReturn(req, res) {
  const { id } = req.params;

  try {
    const rental = await db.query(`SELECT * FROM rentals WHERE id = $1;`, [id]);
    const returnDate = dayjs().format("YYYY-MM-DD");

    if (rental.rowCount != 1) {
      return res.status(404).send("O ID informado não está no banco de dados");
    }

    if (rental.rows[0].returnDate) {
      return res.status(400).send("O aluguel já foi finalizado");
    }

    await db.query(`UPDATE rentals SET "returnDate"=$1 WHERE id = $2`, [
      returnDate,
      id,
    ]);

    const game = await db.query(`SELECT * FROM games WHERE id= $1;`, [
      rental.rows[0].gameId,
    ]);

    const rentalDateB = dayjs(rental.rows[0].rentDate).format("YYYY-MM-DD");
    const dayDalay = dayjs(returnDate).diff(dayjs(rentalDateB), "days");
    const delayFee =
      (dayDalay - rental.rows[0].daysRented) * game.rows[0].pricePerDay;

    if (dayDalay > rental.rows[0].daysRented) {
      await db.query(`UPDATE rentals SET "delayFee"=$1 WHERE id = $2`, [
        delayFee,
        id,
      ]);
    } else {
      await db.query(`UPDATE rentals SET "delayFee"=0 WHERE id = $1`, [id]);
    }

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function deleteRental(req, res) {
  const { id } = req.params;

  try {
    const rental = await db.query(`SELECT * FROM rentals WHERE id = $1;`, [id]);
    if (rental.rowCount != 1) {
      return res
        .status(404)
        .send("Não achamos o seu aluguel por favor confira e tente novamente");
    }
    if (!rental.rows[0].returnDate) {
      return res.status(400).send("O aluguel não foi finalizado");
    }

    await db.query(`DELETE FROM rentals WHERE id=$1;`, [id]);
  } catch (err) {
    res.status(500).send(err.message);
  }

  res.sendStatus(200);
}
