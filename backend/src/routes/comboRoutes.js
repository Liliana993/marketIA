import { Router } from "express";
import * as comboController from "../controllers/comboController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const router = Router();

router.use(authenticate);

router.get("/", comboController.getCombos);
router.get("/:id", comboController.getComboById);

router.post("/", authorize(["admin"]), comboController.createCombo);
router.put("/:id", authorize(["admin"]), comboController.updateCombo);
router.delete("/:id", authorize(["admin"]), comboController.deleteCombo);
router.post("/suggestions", authorize(["admin"]), comboController.suggestCombos);
router.post("/:id/promote", authorize(["admin"]), comboController.promoteCombo);

export default router;
