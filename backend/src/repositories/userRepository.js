import * as userDao from "../dao/userDao.js";

export const createUser = async (userData) => {
  return userDao.createUser(userData);
};

export const findByEmail = async (email) => {
  return userDao.findUserByEmail(email);
};

export const findById = async (id) => {
  return userDao.findUserById(id);
};
