import * as saleRepo from "../repositories/saleRepository.js";
import * as productRepo from "../repositories/productRepository.js";

export const createSale = async (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error("La venta debe tener al menos un producto");
    error.statusCode = 400;
    throw error;
  }

  const productIds = items.map((item) => item.product);
  const products = await productRepo.findByIds(productIds);
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let total = 0;
  const saleItems = [];

  for (const item of items) {
    const product = productMap.get(item.product.toString());

    if (!product) {
      const error = new Error(`Producto ${item.product} no encontrado`);
      error.statusCode = 400;
      throw error;
    }

    if (product.stock < item.quantity) {
      const error = new Error(`No hay suficiente stock de "${product.name}". Disponible: ${product.stock}`);
      error.statusCode = 400;
      throw error;
    }

    const subtotal = product.salePrice * item.quantity;
    total += subtotal;

    saleItems.push({
      product: product._id,
      quantity: item.quantity,
      unitPrice: product.salePrice,
      subtotal,
    });
  }

  const sale = await saleRepo.create({ items: saleItems, total });

  for (const item of saleItems) {
    await productRepo.updateStock(item.product, -item.quantity);
  }

  return sale;
};

export const getSaleById = async (id) => {
  const sale = await saleRepo.findById(id);
  if (!sale) {
    const error = new Error("Venta no encontrada");
    error.statusCode = 404;
    throw error;
  }
  return sale;
};

export const getAllSales = async (query) => {
  const filter = {};

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate + "T23:59:59.999Z");
  }

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 50;
  const skip = (page - 1) * limit;

  const sales = await saleRepo.findAll(filter, { skip, limit });
  const total = await saleRepo.count(filter);

  return { sales, total, page, totalPages: Math.ceil(total / limit) };
};

export const getTopSellingProducts = async (limit = 10) => {
  return saleRepo.getTopSellingProducts(limit);
};

export const getSalesByDate = async (startDate, endDate) => {
  return saleRepo.getSalesByDate(startDate, endDate);
};

export const getTotalSalesByPeriod = async (startDate, endDate) => {
  return saleRepo.getTotalSalesByPeriod(startDate, endDate);
};

export const deleteSale = async (id) => {
  const sale = await saleRepo.findById(id);
  if (!sale) {
    const error = new Error("Venta no encontrada");
    error.statusCode = 404;
    throw error;
  }

  for (const item of sale.items) {
    await productRepo.updateStock(item.product, item.quantity);
  }

  return saleRepo.remove(id);
};
