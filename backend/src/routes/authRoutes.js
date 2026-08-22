import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/current", authenticate, authController.current);
router.post("/logout", authenticate, authController.logout);

export default router;
