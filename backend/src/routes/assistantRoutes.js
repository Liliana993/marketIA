import { Router } from "express";
import * as assistantController from "../controllers/assistantController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.post("/", assistantController.sendMessage);
router.post("/combo-suggestions", assistantController.comboSuggestions);
router.post("/business-analysis", assistantController.businessAnalysis);
router.get("/restock-alerts", assistantController.restockAlerts);
router.get("/margin-analysis", assistantController.marginAnalysis);
router.get("/price-suggestions", assistantController.priceSuggestions);
router.get("/weekly-trends", assistantController.weeklyTrends);

export default router;
