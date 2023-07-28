import { Router } from "express";
import {
  deleteRendal,
  getRentals,
  postRendalsByIdReturn,
  postRentals,
} from "../controllers/rentals.controller.js";

const rentalsRouters = Router();

rentalsRouters.get("/rentals", getRentals);
rentalsRouters.post("/rentals", postRentals);
rentalsRouters.post("/rentals/:id/return", postRendalsByIdReturn);
rentalsRouters.delete("/retals/:id", deleteRendal);

export default rentalsRouters;
