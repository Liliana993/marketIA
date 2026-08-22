import * as productDao from "../dao/productDao.js";

export const create = async (data) => productDao.createProduct(data);

export const findById = async (id) => productDao.findProductById(id);

export const findAll = async (filter, options) => productDao.findAllProducts(filter, options);

export const count = async (filter) => productDao.countProducts(filter);

export const update = async (id, data) => productDao.updateProduct(id, data);

export const remove = async (id) => productDao.deleteProduct(id);

export const updateStock = async (id, quantity) => productDao.updateStock(id, quantity);

export const findLowStock = async () => productDao.findLowStockProducts();

export const findByIds = async (ids) => productDao.findProductsByIds(ids);

export const findBySku = async (sku) => productDao.findProductBySku(sku);