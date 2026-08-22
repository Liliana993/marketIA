import { Router } from "express";
import * as dashboardController from "../controllers/dashboardController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/stats", dashboardController.getStats);

export default router;
