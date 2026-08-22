import { Router } from "express";
import * as categoryController from "../controllers/categoryController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const router = Router();

router.get("/", categoryController.getCategories);

router.post("/", authenticate, authorize(["admin"]), categoryController.createCategory);
router.put("/:id", authenticate, authorize(["admin"]), categoryController.updateCategory);
router.delete("/:id", authenticate, authorize(["admin"]), categoryController.deleteCategory);

export default router;
