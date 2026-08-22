import * as productRepo from "../repositories/productRepository.js";
import * as saleRepo from "../repositories/saleRepository.js";

export const getRestockAlerts = async () => {
  const products = await productRepo.findAll({}, { limit: 500 });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const topSelling = await saleRepo.getTopSellingProducts(100);
  const salesByProduct = {};
  topSelling.forEach((item) => {
    salesByProduct[item._id.toString()] = item.totalQuantity;
  });

  const alerts = products
    .map((product) => {
      const totalSold30d = salesByProduct[product._id.toString()] || 0;
      const dailyRate = totalSold30d / 30;
      const daysUntilStockOut = dailyRate > 0 ? Math.ceil(product.stock / dailyRate) : null;

      let urgency = "low";
      if (product.stock === 0) urgency = "critical";
      else if (daysUntilStockOut !== null && daysUntilStockOut <= 3) urgency = "critical";
      else if (daysUntilStockOut !== null && daysUntilStockOut <= 7) urgency = "high";
      else if (product.stock <= product.minimumStock) urgency = "medium";

      return {
        _id: product._id,
        name: product.name,
        stock: product.stock,
        minimumStock: product.minimumStock,
        unit: product.unit,
        dailyRate: Math.round(dailyRate * 100) / 100,
        daysUntilStockOut,
        urgency,
      };
    })
    .filter((p) => p.urgency !== "low")
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2 };
      return order[a.urgency] - order[b.urgency];
    });

  return alerts;
};
