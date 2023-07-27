import { Router } from "express";
import {
  getCustomers,
  postCustomers,
  getCustomerByID,
} from "../controllers/customers.controller.js";

const customersRouters = Router();

customersRouters.get("/customers", getCustomers);
customersRouters.get("/customers:id", getCustomerByID);
customersRouters.post("/customers", postCustomers);

export default customersRouters;
