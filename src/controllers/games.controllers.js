import { db } from "../database/database.connectiuon.js";
import { gamesSchema } from "../schemas/games.schemas.js";

export async function getGames(req, res) {
  try {
    const games = await db.query("SELECT * FROM games");
    res.send(games.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function postGames(req, res) {
  const { name, image, stockTotal, pricePerDay } = req.body;
  const validation = gamesSchema.validate(req.body);
  if (validation.error) {
    const errors = validation.error.details.map((details) => details.message);
    return res.status(400).send(errors[0]);
  }
  try {
    const game = await db.query(
      ` SELECT * FROM games WHERE name = '${name}'; `
    );
    if (game.rowCount != 0) {
      return res.status(409).send("Esse BoardGame já está cadastrado");
    } else {
      await db.query(
        `INSERT INTO games ("name", "image", "stockTotal", "pricePerDay" ) VALUES ($1, $2, $3, $4);`,
        [name, image, stockTotal, pricePerDay]
      );
      res.sendStatus(201);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}
