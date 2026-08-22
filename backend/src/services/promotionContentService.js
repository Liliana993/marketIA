import { generateContent } from "../integrations/gemini/geminiClient.js";
import { PROMOTION_CONTENT_PROMPT } from "../integrations/gemini/geminiPrompts.js";

export const generatePromotionContent = async (combo, channel) => {
  const comboContext = `
Nombre del combo: ${combo.name}
Descripción: ${combo.description || "Sin descripción"}
Productos incluidos:
${combo.items.map((item) => `- ${item.product.name} x${item.quantity} — $${item.product.salePrice} c/u`).join("\n")}
Precio individual total: $${combo.regularPrice}
Precio del combo: $${combo.comboPrice}
Ahorro: $${combo.discount} (${Math.round((combo.discount / combo.regularPrice) * 100)}% de descuento)`;

  const response = await generateContent(PROMOTION_CONTENT_PROMPT(channel), comboContext);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        title: `${combo.name} - ¡Oferta especial!`,
        text: response,
        cta: "¡Compralo ahora!",
        hashtags: ["ofertas", "minimercado", "ahorro"],
      };
    }
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {
      title: `${combo.name} - ¡Oferta especial!`,
      text: response,
      cta: "¡Compralo ahora!",
      hashtags: ["ofertas", "minimercado", "ahorro"],
    };
  }
};
