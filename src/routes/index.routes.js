import { Router } from "express";
import gamesRouter from "./games.routes.js";
import customersRouters from "./customers.routes.js";
import rentalsRouters from "./rentals.routes.js";

const router = Router();

router.use(gamesRouter);
router.use(customersRouters);
router.use(rentalsRouters);

export default router;
