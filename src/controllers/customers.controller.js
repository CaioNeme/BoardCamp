import { db } from "../database/database.connectiuon.js";
import { customersSchemas } from "../schemas/customers.schemas.js";

export async function getCustomers(req, res) {
  try {
    const customers = await db.query("SELECT * FROM customers");
    res.send(customers.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function postCustomers(req, res) {
  const { name, phone, cpf, birthday } = req.body;
  const validation = customersSchemas.validate(req.body);

  if (validation.error) {
    const errors = validation.error.details.map((details) => details.message);
    return res.status(400).send(errors[0]);
  }

  try {
    const customer = await db.query(
      ` SELECT * FROM customers WHERE cpf = '${cpf}'; `
    );

    if (customer.rowCount != 0) {
      return res.status(409).send("Esse usuário já está cadastrado");
    } else {
      await db.query(
        `INSERT INTO customers ("name", "phone", "cpf", "birthday" ) VALUES ($1, $2, $3, $4);`,
        [name, phone, cpf, birthday]
      );
      res.sendStatus(201);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}
