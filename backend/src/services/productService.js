import * as productRepo from "../repositories/productRepository.js";

export const createProduct = async (data) => {
  return productRepo.create(data);
};

export const getProductById = async (id) => {
  const product = await productRepo.findById(id);
  if (!product) {
    const error = new Error("Producto no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return product;
};

export const getAllProducts = async (query) => {
  const filter = {};

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
      { sku: { $regex: query.search, $options: "i" } },
    ];
  }

  if (query.category) {
    filter.category = query.category;
  }

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 50;
  const skip = (page - 1) * limit;

  const products = await productRepo.findAll(filter, { skip, limit });
  const total = await productRepo.count(filter);

  return { products, total, page, totalPages: Math.ceil(total / limit) };
};

export const updateProduct = async (id, data) => {
  const product = await productRepo.update(id, data);
  if (!product) {
    const error = new Error("Producto no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return product;
};

export const deleteProduct = async (id) => {
  const product = await productRepo.remove(id);
  if (!product) {
    const error = new Error("Producto no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return product;
};

export const updateStock = async (id, quantity) => {
  const product = await productRepo.findById(id);
  if (!product) {
    const error = new Error("Producto no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const newStock = product.stock + quantity;
  if (newStock < 0) {
    const error = new Error("El stock no puede ser negativo");
    error.statusCode = 400;
    throw error;
  }

  return productRepo.updateStock(id, quantity);
};

export const getLowStockProducts = async () => {
  return productRepo.findLowStock();
};

export const getProductBySku = async (sku) => {
  const product = await productRepo.findBySku(sku);
  if (!product) {
    const error = new Error("Producto no encontrado con ese código");
    error.statusCode = 404;
    throw error;
  }
  return product;
};
