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
    res.send(result.rows);
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

    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function postRendalsByIdReturn(req, res) {
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

    const rentalDateB = dayjs(rental.rows[0].rentDate).format("YYYY-MM-DD");
    const dayDalay = dayjs(returnDate).diff(dayjs(rentalDateB), "d");
    const delayFee = dayDalay * rental.rows[0].originalPrice;

    if (dayDalay > 0) {
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

export async function deleteRendal(req, res) {
  const { id } = req.params;

  res.sendStatus(200);
}
