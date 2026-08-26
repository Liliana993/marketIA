import * as dashboardService from "../services/dashboardService.js";

export const getStats = async (req, res, next) => {
  try {
    const { todayStart, todayEnd } = req.query;
    const stats = await dashboardService.getDashboardStats(todayStart, todayEnd);
    res.json({ status: "success", stats });
  } catch (error) {
    next(error);
  }
};
