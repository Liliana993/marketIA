import { generateContent } from "../integrations/gemini/geminiClient.js";
import { COMBO_SUGGESTION_PROMPT } from "../integrations/gemini/geminiPrompts.js";
import * as productRepo from "../repositories/productRepository.js";
import * as saleRepo from "../repositories/saleRepository.js";
import * as comboRepo from "../repositories/comboRepository.js";

export const suggestCombos = async () => {
  const products = await productRepo.findAll({}, { limit: 200 });
  const lowStock = await productRepo.findLowStock();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const topSelling = await saleRepo.getTopSellingProducts(10);
  const existingCombos = await comboRepo.findAll({}, { limit: 20 });

  const context = `
Productos disponibles:
${products.map((p) => `- ${p.name}: precio venta $${p.salePrice}, stock ${p.stock}, categoría ${p.category?.name || "sin categoría"}`).join("\n")}

Productos con stock bajo:
${lowStock.length > 0 ? lowStock.map((p) => `- ${p.name}: stock ${p.stock}`).join("\n") : "Ninguno"}

Productos más vendidos (última semana):
${topSelling.length > 0 ? topSelling.map((item) => `- ${item.product.name}: ${item.totalQuantity} unidades vendidas`).join("\n") : "Sin datos de ventas"}

Combos existentes:
${existingCombos.length > 0 ? existingCombos.map((c) => `- ${c.name}: $${c.comboPrice}`).join("\n") : "Ninguno"}`;

  const response = await generateContent(COMBO_SUGGESTION_PROMPT, context);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      const error = new Error("No se pudieron generar sugerencias");
      error.statusCode = 500;
      throw error;
    }
    return JSON.parse(jsonMatch[0]);
  } catch {
    const error = new Error("Error al procesar las sugerencias de la IA");
    error.statusCode = 500;
    throw error;
  }
};
