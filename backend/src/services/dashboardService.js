import * as productRepo from "../repositories/productRepository.js";
import * as saleRepo from "../repositories/saleRepository.js";
import * as comboRepo from "../repositories/comboRepository.js";
import * as promotionRepo from "../repositories/promotionRepository.js";

export const getDashboardStats = async () => {
  const now = new Date();

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    todaySales,
    weekSales,
    totalProducts,
    lowStockProducts,
    topSelling,
    activeCombos,
    pendingPromotions,
  ] = await Promise.all([
    saleRepo.getTotalSalesByPeriod(startOfDay, endOfDay),
    saleRepo.getTotalSalesByPeriod(weekAgo, now),
    productRepo.count({}),
    productRepo.findLowStock(),
    saleRepo.getTopSellingProducts(5),
    comboRepo.count({ active: true }),
    promotionRepo.count({ status: "pending" }),
  ]);

  return {
    todaySales: {
      total: todaySales.total,
      count: todaySales.count,
    },
    weekSales: {
      total: weekSales.total,
      count: weekSales.count,
    },
    totalProducts,
    lowStockCount: lowStockProducts.length,
    lowStockProducts: lowStockProducts.map((p) => ({
      _id: p._id,
      name: p.name,
      stock: p.stock,
      minimumStock: p.minimumStock,
      category: p.category,
    })),
    topSelling: topSelling.map((item) => ({
      _id: item._id,
      name: item.product.name,
      totalQuantity: item.totalQuantity,
      totalRevenue: item.totalRevenue,
    })),
    activeCombos,
    pendingPromotions,
  };
};
