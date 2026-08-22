import * as categoryDao from "../dao/categoryDao.js";

export const createCategory = async (categoryData) => {
  return categoryDao.createCategory(categoryData);
};

export const findById = async (id) => {
  return categoryDao.findCategoryById(id);
};

export const findAll = async () => {
  return categoryDao.findAllCategories();
};

export const update = async (id, updateData) => {
  return categoryDao.updateCategory(id, updateData);
};

export const remove = async (id) => {
  return categoryDao.deleteCategory(id);
};

export const findByName = async (name) => {
  return categoryDao.findCategoryByName(name);
};
