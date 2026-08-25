import * as comboService from "../services/comboService.js";
import * as comboSuggestionService from "../services/comboSuggestionService.js";
import * as promotionService from "../services/promotionService.js";
import { generatePromotionContent } from "../services/promotionContentService.js";
import * as n8nEvents from "../integrations/n8n/n8nEvents.js";

export const getCombos = async (req, res, next) => {
  try {
    const result = await comboService.getAllCombos(req.query);
    res.json({ status: "success", ...result });
  } catch (error) {
    next(error);
  }
};

export const getComboById = async (req, res, next) => {
  try {
    const combo = await comboService.getComboById(req.params.id);
    res.json({ status: "success", combo });
  } catch (error) {
    next(error);
  }
};

export const createCombo = async (req, res, next) => {
  try {
    const { name, items, comboPrice } = req.body;

    if (!name || !items || !Array.isArray(items) || items.length === 0 || comboPrice === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Nombre, items y precio del combo son requeridos",
      });
    }

    const combo = await comboService.createCombo(req.body);
    res.status(201).json({ status: "success", combo });
  } catch (error) {
    next(error);
  }
};

export const updateCombo = async (req, res, next) => {
  try {
    const combo = await comboService.updateCombo(req.params.id, req.body);
    res.json({ status: "success", combo });
  } catch (error) {
    next(error);
  }
};

export const deleteCombo = async (req, res, next) => {
  try {
    await comboService.deleteCombo(req.params.id);
    res.json({ status: "success", message: "Combo eliminado" });
  } catch (error) {
    next(error);
  }
};

export const suggestCombos = async (req, res, next) => {
  try {
    const suggestions = await comboSuggestionService.suggestCombos();
    res.json({ status: "success", suggestions });
  } catch (error) {
    console.error("Combo suggestions error:", error.message);
    next(error);
  }
};

export const promoteCombo = async (req, res, next) => {
  try {
    const { channel } = req.body;

    if (!channel || !["instagram", "facebook", "whatsapp"].includes(channel)) {
      return res.status(400).json({
        status: "error",
        message: "Canal inválido. Use: instagram, facebook o whatsapp",
      });
    }

    const stockCheck = await comboService.checkComboStockAvailability(req.params.id);
    if (!stockCheck.available) {
      return res.status(400).json({
        status: "error",
        message: stockCheck.reason,
      });
    }

    const combo = await comboService.getComboById(req.params.id);
    const promotion = await promotionService.createPromotion(req.params.id, channel);

    let content;
    try {
      content = await generatePromotionContent(combo, channel);
    } catch {
      content = {
        title: `${combo.name} - ¡Oferta especial!`,
        text: `¡Aprovechá el combo ${combo.name}! Por solo $${combo.comboPrice} te llevás todos los productos. Ahorrás $${combo.discount} respecto al precio regular.`,
        cta: "¡Compralo ahora!",
        hashtags: ["ofertas", "minimercado", "ahorro", channel],
      };
    }

    await promotionService.updateGeneratedContent(promotion._id, content);
    const updated = await promotionService.getPromotionById(promotion._id);

    try {
      await n8nEvents.emitComboPromotionRequested(updated, combo);
    } catch {
      // n8n no disponible
    }

    res.status(201).json({ status: "success", promotion: updated });
  } catch (error) {
    next(error);
  }
};
