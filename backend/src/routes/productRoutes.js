import { Router } from "express";
import * as productController from "../controllers/productController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const router = Router();

router.use(authenticate);

router.get("/low-stock", productController.getLowStockProducts);
router.get("/sku/:sku", productController.getProductBySku);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

router.post("/", authorize(["admin"]), productController.createProduct);
router.put("/:id", authorize(["admin"]), productController.updateProduct);
router.delete("/:id", authorize(["admin"]), productController.deleteProduct);
router.put("/:id/stock", authorize(["admin"]), productController.updateStock);

export default router;
