import * as dashboardService from "../services/dashboardService.js";

export const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json({ status: "success", stats });
  } catch (error) {
    next(error);
  }
};
