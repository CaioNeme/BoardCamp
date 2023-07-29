import dayjs from "dayjs";
import { db } from "../database/database.connectiuon.js";
import { customersSchema } from "../schemas/customers.schemas.js";

export async function getCustomers(req, res) {
  try {
    const customers = await db.query("SELECT * FROM customers");
    customers.rows.forEach((user) => {
      user.birthday = dayjs(user.birthday).format("YYYY-MM-DD");
    });

    res.send(customers.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function postCustomers(req, res) {
  const { name, phone, cpf, birthday } = req.body;
  const validation = customersSchema.validate(req.body);

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
        [name, phone, cpf, dayjs(birthday).format("YYYY-MM-DD")]
      );
      res.sendStatus(201);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function getCustomerByID(req, res) {
  const { id } = req.params;
  try {
    const user = await db.query(`SELECT * FROM customers WHERE id = ${id}`);
    if (user.rowCount != 1) {
      return res.status(404).send("Usuário não encontrado");
    }
    const userReformat = {
      id: user.rows[0].id,
      name: user.rows[0].name,
      phone: user.rows[0].phone,
      cpf: user.rows[0].cpf,
      birthday: dayjs(user.rows[0].birthday).format("YYYY-MM-DD"),
    };
    res.send(userReformat);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function putCustomers(req, res) {
  const validation = customersSchema.validate(req.body);

  if (validation.error) {
    const errors = validation.error.details.map((details) => details.message);
    return res.status(400).send(errors[0]);
  }

  try {
    const { id } = req.params;
    const { name, phone, cpf, birthday } = req.body;
    const customers = await db.query(
      ` SELECT * FROM customers WHERE id = $1;`,
      [id]
    );

    if (customers.rows[0].id != Number(id)) {
      return res.statusStatus(409);
    }
    if (customers.rowCount === 0) {
      return res.sendStatus(409);
    }
    if (customers.rowCount > 0 && customers.rows[0].id !== Number(id))
      return res.sendStatus(409);

    await db.query(
      `UPDATE customers
          SET name = $1, phone = $2, cpf = $3, birthday = $4
          WHERE id = $5`,
      [name, phone, cpf, birthday, id]
    );

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
