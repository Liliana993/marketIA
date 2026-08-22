import { Router } from "express";
import * as webhookController from "../controllers/webhookController.js";
import { webhookAuth } from "../middlewares/webhookAuth.js";

const router = Router();

router.use(webhookAuth);

router.post("/n8n/promotion-result", webhookController.handlePromotionResult);
router.post("/n8n/publication-result", webhookController.handlePublicationResult);

export default router;
