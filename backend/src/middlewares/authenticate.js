import jwt from "jsonwebtoken";
import { findById } from "../repositories/userRepository.js";

export const authenticate = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ status: "error", message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findById(decoded.id);

    if (!user) {
      return res.status(401).json({ status: "error", message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: "error", message: "Invalid token" });
  }
};

export const optionalAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findById(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch {
    // ignore invalid token
  }

  next();
};
