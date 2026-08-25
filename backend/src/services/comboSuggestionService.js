import { generateContent } from "../integrations/gemini/geminiClient.js";
import { COMBO_SUGGESTION_PROMPT } from "../integrations/gemini/geminiPrompts.js";
import * as productRepo from "../repositories/productRepository.js";
import * as saleRepo from "../repositories/saleRepository.js";
import * as comboRepo from "../repositories/comboRepository.js";

export const suggestCombos = async () => {
  const products = await productRepo.findAll({}, { limit: 50 });
  const lowStock = await productRepo.findLowStock();
  const topSelling = await saleRepo.getTopSellingProducts(5);
  const existingCombos = await comboRepo.findAll({}, { limit: 10 });

  const context = `Productos: ${products.map((p) => `${p.name}|$${p.salePrice}|stock:${p.stock}|${p.category?.name || "sin cat"}`).join("; ")}

Stock bajo: ${lowStock.length > 0 ? lowStock.map((p) => `${p.name}:${p.stock}`).join(", ") : "Ninguno"}

Más vendidos: ${topSelling.length > 0 ? topSelling.map((i) => `${i.product.name}:${i.totalQuantity}u`).join(", ") : "Sin datos"}

Combos existentes: ${existingCombos.length > 0 ? existingCombos.map((c) => `${c.name}:$${c.comboPrice}`).join(", ") : "Ninguno"}`;

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
