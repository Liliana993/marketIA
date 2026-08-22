import * as productRepo from "../repositories/productRepository.js";
import * as saleRepo from "../repositories/saleRepository.js";

export const getPriceSuggestions = async () => {
  const products = await productRepo.findAll({}, { limit: 500 });
  const topSelling = await saleRepo.getTopSellingProducts(100);

  const salesByProduct = {};
  topSelling.forEach((item) => {
    salesByProduct[item._id.toString()] = item.totalQuantity;
  });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const suggestions = products
    .filter((p) => p.salePrice > 0 && p.purchasePrice > 0)
    .map((product) => {
      const totalSold = salesByProduct[product._id.toString()] || 0;
      const dailyRate = totalSold / 30;
      const currentMargin = ((product.salePrice - product.purchasePrice) / product.purchasePrice) * 100;

      let suggestion = "mantener";
      let suggestedPrice = product.salePrice;
      let reason = "";

      if (totalSold === 0) {
        suggestedPrice = Math.round(product.purchasePrice * 1.15);
        suggestion = "bajar";
        reason = "Sin ventas en 30 días, bajar precio para incentivar compra";
      } else if (dailyRate > 2) {
        const increase = Math.round(product.salePrice * 0.05);
        suggestedPrice = product.salePrice + increase;
        suggestion = "subir";
        reason = "Alta demanda (+2 vendidos/día), se puede aumentar precio";
      } else if (dailyRate > 1 && currentMargin < 20) {
        suggestedPrice = Math.round(product.purchasePrice * 1.25);
        suggestion = "subir";
        reason = "Bajo margen pero buena demanda, hay espacio para subir";
      } else if (dailyRate < 0.3 && currentMargin > 40) {
        const decrease = Math.round(product.salePrice * 0.1);
        suggestedPrice = product.salePrice - decrease;
        suggestion = "bajar";
        reason = "Baja demanda y alto margen, bajar precio para mejorar rotación";
      }

      return {
        _id: product._id,
        name: product.name,
        currentPrice: product.salePrice,
        purchasePrice: product.purchasePrice,
        currentMargin: Math.round(currentMargin),
        dailyRate: Math.round(dailyRate * 100) / 100,
        totalSold,
        suggestion,
        suggestedPrice,
        reason,
      };
    })
    .filter((s) => s.suggestion !== "mantener")
    .sort((a, b) => {
      const order = { subir: 0, bajar: 1 };
      return order[a.suggestion] - order[b.suggestion];
    });

  return suggestions;
};
