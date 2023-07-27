import { Router } from "express";
import gamesRouter from "./games.routes.js";
import customersRouters from "./customers.routes.js";

const router = Router();

router.use(gamesRouter);
router.use(customersRouters);

export default router;
