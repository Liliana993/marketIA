import Combo from "../models/Combo.js";

export const createCombo = async (data) => {
  return Combo.create(data);
};

export const findComboById = async (id) => {
  return Combo.findById(id).populate("items.product");
};

export const findAllCombos = async (filter = {}, options = {}) => {
  const { skip = 0, limit = 50 } = options;
  return Combo.find(filter).populate("items.product").sort({ createdAt: -1 }).skip(skip).limit(limit);
};

export const countCombos = async (filter = {}) => {
  return Combo.countDocuments(filter);
};

export const updateCombo = async (id, data) => {
  return Combo.findByIdAndUpdate(id, data, { returnDocument: 'after' }).populate("items.product");
};

export const deleteCombo = async (id) => {
  return Combo.findByIdAndDelete(id);
};

export const findActiveCombos = async () => {
  return Combo.find({ active: true }).populate("items.product");
};
