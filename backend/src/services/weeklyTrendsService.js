import * as saleRepo from "../repositories/saleRepository.js";

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const getWeeklyTrends = async () => {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const Sales = (await import("../models/Sale.js")).default;

  const results = await Sales.aggregate([
    { $match: { createdAt: { $gte: ninetyDaysAgo } } },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        totalSales: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const trends = dayNames.map((name, index) => {
    const mongoDay = index === 0 ? 7 : index;
    const dayData = results.find((r) => r._id === mongoDay);
    return {
      day: name,
      dayIndex: index,
      totalSales: dayData ? dayData.totalSales : 0,
      saleCount: dayData ? dayData.count : 0,
      avgTicket: dayData && dayData.count > 0 ? Math.round(dayData.totalSales / dayData.count) : 0,
    };
  });

  const bestDay = trends.reduce((max, d) => (d.totalSales > max.totalSales ? d : max), trends[0]);
  const worstDay = trends.reduce((min, d) => (d.totalSales < min.totalSales ? d : min), trends[0]);

  return {
    trends,
    bestDay: bestDay.day,
    worstDay: worstDay.day,
    totalRevenue: trends.reduce((sum, d) => sum + d.totalSales, 0),
  };
};
