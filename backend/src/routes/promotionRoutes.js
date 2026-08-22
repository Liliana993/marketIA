import { Router } from "express";
import * as promotionController from "../controllers/promotionController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const router = Router();

router.use(authenticate);

router.get("/", promotionController.getPromotions);
router.get("/:id", promotionController.getPromotionById);

router.post("/:id/approve", authorize(["admin"]), promotionController.approvePromotion);
router.post("/:id/reject", authorize(["admin"]), promotionController.rejectPromotion);
router.post("/:id/retry", authorize(["admin"]), promotionController.retryPromotion);
router.delete("/:id", authorize(["admin"]), promotionController.deletePromotion);

export default router;
