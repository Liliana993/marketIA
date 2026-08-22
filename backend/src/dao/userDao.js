import User from "../models/User.js";

export const createUser = async (userData) => {
  return User.create(userData);
};

export const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

export const findUserById = async (id) => {
  return User.findById(id);
};
