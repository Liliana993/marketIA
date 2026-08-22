import Product from "../models/Product.js";

export const createProduct = async (data) => {
  return Product.create(data);
};

export const findProductById = async (id) => {
  return Product.findById(id).populate("category");
};

export const findAllProducts = async (filter = {}, options = {}) => {
  const { skip = 0, limit = 50 } = options;
  return Product.find(filter).populate("category").sort({ createdAt: -1 }).skip(skip).limit(limit);
};

export const countProducts = async (filter = {}) => {
  return Product.countDocuments(filter);
};

export const updateProduct = async (id, data) => {
  return Product.findByIdAndUpdate(id, data, { returnDocument: 'after' }).populate("category");
};

export const deleteProduct = async (id) => {
  return Product.findByIdAndDelete(id);
};

export const updateStock = async (id, quantity) => {
  return Product.findByIdAndUpdate(id, { $inc: { stock: quantity } }, { returnDocument: 'after' });
};

export const findLowStockProducts = async () => {
  return Product.find({ $expr: { $lte: ["$stock", "$minimumStock"] } }).populate("category");
};

export const findProductsByIds = async (ids) => {
  return Product.find({ _id: { $in: ids } });
};

export const findProductBySku = async (sku) => {
  return Product.findOne({ sku }).populate("category");
};
