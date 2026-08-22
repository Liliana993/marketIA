import Category from "../models/Category.js";

export const createCategory = async (categoryData) => {
  return Category.create(categoryData);
};

export const findCategoryById = async (id) => {
  return Category.findById(id);
};

export const findAllCategories = async () => {
  return Category.find().sort({ name: 1 });
};

export const updateCategory = async (id, updateData) => {
  return Category.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
};

export const deleteCategory = async (id) => {
  return Category.findByIdAndDelete(id);
};

export const findCategoryByName = async (name) => {
  return Category.findOne({ name });
};
