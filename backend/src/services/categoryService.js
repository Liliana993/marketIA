import * as categoryRepository from "../repositories/categoryRepository.js";

export const createCategory = async (categoryData) => {
  const existing = await categoryRepository.findByName(categoryData.name);
  if (existing) {
    const error = new Error("Category already exists");
    error.statusCode = 400;
    throw error;
  }
  return categoryRepository.createCategory(categoryData);
};

export const getAllCategories = async () => {
  return categoryRepository.findAll();
};

export const getCategoryById = async (id) => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }
  return category;
};

export const updateCategory = async (id, updateData) => {
  const category = await categoryRepository.update(id, updateData);
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }
  return category;
};

export const deleteCategory = async (id) => {
  const category = await categoryRepository.remove(id);
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }
  return category;
};
