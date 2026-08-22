import { generateContent } from "../integrations/gemini/geminiClient.js";
import { ASSISTANT_SYSTEM_PROMPT } from "../integrations/gemini/geminiPrompts.js";
import * as productRepo from "../repositories/productRepository.js";
import * as saleRepo from "../repositories/saleRepository.js";
import * as comboRepo from "../repositories/comboRepository.js";

const getBusinessContext = async () => {
  const lowStockProducts = await productRepo.findLowStock();
  const topSelling = await saleRepo.getTopSellingProducts(5);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekSales = await saleRepo.getTotalSalesByPeriod(weekAgo, now);
  const salesByDate = await saleRepo.getSalesByDate(weekAgo, now);

  const allProducts = await productRepo.findAll({}, { limit: 200 });
  const activeCombos = await comboRepo.findActive();

  return {
    lowStockProducts: lowStockProducts.map((p) => ({
      name: p.name,
      stock: p.stock,
      minimumStock: p.minimumStock,
    })),
    topSelling: topSelling.map((item) => ({
      name: item.product.name,
      quantitySold: item.totalQuantity,
      revenue: item.totalRevenue,
    })),
    weeklySales: {
      total: weekSales.total,
      count: weekSales.count,
      byDate: salesByDate,
    },
    productCount: allProducts.length,
    activeComboCount: activeCombos.length,
  };
};

export const sendMessage = async (message) => {
  const context = await getBusinessContext();

  const contextMessage = `
Datos actuales del negocio:
- Total de productos: ${context.productCount}
- Combos activos: ${context.activeComboCount}
- Ventas de la semana: $${context.weeklySales.total} (${context.weeklySales.count} ventas)
- Productos con stock bajo: ${context.lowStockProducts.length > 0 ? context.lowStockProducts.map((p) => `${p.name} (stock: ${p.stock}, mínimo: ${p.minimumStock})`).join(", ") : "Ninguno"}
- Productos más vendidos (semana): ${context.topSelling.length > 0 ? context.topSelling.map((p) => `${p.name} (${p.quantitySold} unidades)`).join(", ") : "Sin datos"}

Pregunta del comerciante: ${message}`;

  return generateContent(ASSISTANT_SYSTEM_PROMPT, contextMessage);
};
