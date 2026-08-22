import { Router } from "express";
import * as saleController from "../controllers/saleController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const router = Router();

router.use(authenticate);

router.get("/stats", saleController.getSalesStats);
router.get("/", saleController.getSales);
router.get("/:id", saleController.getSaleById);

router.post("/", authorize(["admin"]), saleController.createSale);

export default router;
