import * as comboRepo from "../repositories/comboRepository.js";
import * as productRepo from "../repositories/productRepository.js";

const calculateRegularPrice = async (items) => {
  const productIds = items.map((item) => item.product);
  const products = await productRepo.findByIds(productIds);
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let regularPrice = 0;
  for (const item of items) {
    const product = productMap.get(item.product.toString());
    if (product) {
      regularPrice += product.salePrice * item.quantity;
    }
  }

  return regularPrice;
};

const validateProductsExist = async (items) => {
  const productIds = items.map((item) => item.product);
  const products = await productRepo.findByIds(productIds);

  if (products.length !== productIds.length) {
    const error = new Error("Uno o más productos no existen");
    error.statusCode = 400;
    throw error;
  }

  return products;
};

export const createCombo = async (data) => {
  await validateProductsExist(data.items);

  const regularPrice = await calculateRegularPrice(data.items);
  const discount = regularPrice - data.comboPrice;

  if (discount < 0) {
    const error = new Error("El precio del combo no puede superar el precio regular");
    error.statusCode = 400;
    throw error;
  }

  return comboRepo.create({
    ...data,
    regularPrice,
    discount,
  });
};

export const getComboById = async (id) => {
  const combo = await comboRepo.findById(id);
  if (!combo) {
    const error = new Error("Combo no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return combo;
};

export const getAllCombos = async (query) => {
  const filter = {};

  if (query.active !== undefined) {
    filter.active = query.active === "true";
  }

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 50;
  const skip = (page - 1) * limit;

  const combos = await comboRepo.findAll(filter, { skip, limit });
  const total = await comboRepo.count(filter);

  return { combos, total, page, totalPages: Math.ceil(total / limit) };
};

export const updateCombo = async (id, data) => {
  if (data.items) {
    await validateProductsExist(data.items);
    const regularPrice = await calculateRegularPrice(data.items);
    const discount = regularPrice - (data.comboPrice || 0);

    if (discount < 0) {
      const error = new Error("El precio del combo no puede superar el precio regular");
      error.statusCode = 400;
      throw error;
    }

    data.regularPrice = regularPrice;
    data.discount = discount;
  }

  const combo = await comboRepo.update(id, data);
  if (!combo) {
    const error = new Error("Combo no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return combo;
};

export const deleteCombo = async (id) => {
  const combo = await comboRepo.remove(id);
  if (!combo) {
    const error = new Error("Combo no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return combo;
};

export const checkComboStockAvailability = async (comboId) => {
  const combo = await comboRepo.findById(comboId);
  if (!combo) return { available: false, reason: "Combo no encontrado" };

  for (const item of combo.items) {
    const product = await productRepo.findById(item.product._id);
    if (!product || product.stock < item.quantity) {
      return {
        available: false,
        reason: `No hay suficiente stock de "${item.product.name}"`,
      };
    }
  }

  return { available: true };
};
