import * as productRepo from "../repositories/productRepository.js";
import * as saleRepo from "../repositories/saleRepository.js";

export const getMarginAnalysis = async () => {
  const products = await productRepo.findAll({}, { limit: 500 });
  const topSelling = await saleRepo.getTopSellingProducts(100);

  const salesByProduct = {};
  topSelling.forEach((item) => {
    salesByProduct[item._id.toString()] = {
      totalQuantity: item.totalQuantity,
      totalRevenue: item.totalRevenue,
    };
  });

  const analysis = products
    .filter((p) => p.salePrice > 0 && p.purchasePrice > 0)
    .map((product) => {
      const margin = product.salePrice - product.purchasePrice;
      const marginPercent = ((margin / product.purchasePrice) * 100).toFixed(1);
      const sales = salesByProduct[product._id.toString()] || { totalQuantity: 0, totalRevenue: 0 };
      const totalProfit = margin * sales.totalQuantity;

      return {
        _id: product._id,
        name: product.name,
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        margin,
        marginPercent: parseFloat(marginPercent),
        totalSold: sales.totalQuantity,
        totalProfit: Math.round(totalProfit * 100) / 100,
        category: product.category?.name || "Sin categoría",
      };
    })
    .sort((a, b) => b.marginPercent - a.marginPercent);

  return analysis;
};
