import { generateContent } from "../integrations/gemini/geminiClient.js";
import { COMBO_SUGGESTION_PROMPT } from "../integrations/gemini/geminiPrompts.js";
import * as productRepo from "../repositories/productRepository.js";
import * as saleRepo from "../repositories/saleRepository.js";
import * as comboRepo from "../repositories/comboRepository.js";

export const suggestCombos = async () => {
  const products = await productRepo.findAll({}, { limit: 50 });
  const lowStock = await productRepo.findLowStock();
  let topSelling = [];
  try {
    topSelling = await saleRepo.getTopSellingProducts(5);
  } catch {
    topSelling = [];
  }
  const existingCombos = await comboRepo.findAll({}, { limit: 10 });

  const productList = (Array.isArray(products) ? products : []).map((p) => `${p.name}|$${p.salePrice}|stock:${p.stock}|${p.category?.name || "sin cat"}`).join("; ");
  const lowStockList = (Array.isArray(lowStock) ? lowStock : []).map((p) => `${p.name}:${p.stock}`).join(", ");
  const topSellingList = (Array.isArray(topSelling) ? topSelling : []).map((i) => `${i.product?.name || "prod"}:${i.totalQuantity}u`).join(", ");
  const comboList = (Array.isArray(existingCombos) ? existingCombos : []).map((c) => `${c.name}:$${c.comboPrice}`).join(", ");

  const context = `Productos: ${productList || "Ninguno"}

Stock bajo: ${lowStockList || "Ninguno"}

Más vendidos: ${topSellingList || "Sin datos"}

Combos existentes: ${comboList || "Ninguno"}`;

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
