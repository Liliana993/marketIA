import * as productService from "../services/productService.js";

export const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getAllProducts(req.query);
    res.json({ status: "success", ...result });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ status: "success", product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, category, purchasePrice, salePrice, minimumStock } = req.body;

    const missing = [];
    if (!name) missing.push("nombre");
    if (!category) missing.push("categoría");
    if (purchasePrice === undefined || purchasePrice === null) missing.push("precio de compra");
    if (salePrice === undefined || salePrice === null) missing.push("precio de venta");
    if (minimumStock === undefined || minimumStock === null) missing.push("stock mínimo");

    if (missing.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Faltan campos: ${missing.join(", ")}`,
      });
    }

    const product = await productService.createProduct(req.body);
    res.status(201).json({ status: "success", product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ status: "success", product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ status: "success", message: "Producto eliminado" });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || typeof quantity !== "number") {
      return res.status(400).json({
        status: "error",
        message: "La cantidad es requerida y debe ser un número",
      });
    }

    const product = await productService.updateStock(req.params.id, quantity);
    res.json({ status: "success", product });
  } catch (error) {
    next(error);
  }
};

export const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await productService.getLowStockProducts();
    res.json({ status: "success", products });
  } catch (error) {
    next(error);
  }
};

export const getProductBySku = async (req, res, next) => {
  try {
    const product = await productService.getProductBySku(req.params.sku);
    res.json({ status: "success", product });
  } catch (error) {
    next(error);
  }
};
