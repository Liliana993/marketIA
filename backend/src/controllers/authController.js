import * as authService from "../services/authService.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

export const register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ status: "error", message: "All fields are required" });
    }

    const { user, token } = await authService.register({
      first_name,
      last_name,
      email,
      password,
    });

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ status: "success", user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email and password are required" });
    }

    const { user, token } = await authService.login(email, password);

    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({ status: "success", user });
  } catch (error) {
    next(error);
  }
};

export const current = (req, res) => {
  res.json({ status: "success", user: req.user });
};

export const logout = (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ status: "success", message: "Logged out" });
};
