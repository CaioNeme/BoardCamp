import { Router } from "express";
import {
  deleteRental,
  getRentals,
  postRentalsByIdReturn,
  postRentals,
} from "../controllers/rentals.controller.js";

const rentalsRouters = Router();

rentalsRouters.get("/rentals", getRentals);
rentalsRouters.post("/rentals", postRentals);
rentalsRouters.post("/rentals/:id/return", postRentalsByIdReturn);
rentalsRouters.delete("/rentals/:id", deleteRental);

export default rentalsRouters;
