import * as promotionService from "../services/promotionService.js";
import * as comboService from "../services/comboService.js";
import { generatePromotionContent } from "../services/promotionContentService.js";
import * as n8nEvents from "../integrations/n8n/n8nEvents.js";

export const getPromotions = async (req, res, next) => {
  try {
    const result = await promotionService.getAllPromotions(req.query);
    res.json({ status: "success", ...result });
  } catch (error) {
    next(error);
  }
};

export const getPromotionById = async (req, res, next) => {
  try {
    const promotion = await promotionService.getPromotionById(req.params.id);
    res.json({ status: "success", promotion });
  } catch (error) {
    next(error);
  }
};

export const approvePromotion = async (req, res, next) => {
  try {
    const promotion = await promotionService.approvePromotion(req.params.id);

    try {
      const combo = await comboService.getComboById(promotion.combo._id);
      await n8nEvents.emitPromotionApproved(promotion, combo);
    } catch {
      // n8n no disponible
    }

    res.json({ status: "success", promotion });
  } catch (error) {
    next(error);
  }
};

export const rejectPromotion = async (req, res, next) => {
  try {
    const promotion = await promotionService.rejectPromotion(req.params.id);
    res.json({ status: "success", promotion });
  } catch (error) {
    next(error);
  }
};

export const deletePromotion = async (req, res, next) => {
  try {
    await promotionService.deletePromotion(req.params.id);
    res.json({ status: "success", message: "Publicación eliminada" });
  } catch (error) {
    next(error);
  }
};

export const retryPromotion = async (req, res, next) => {
  try {
    const promotion = await promotionService.getPromotionById(req.params.id);
    const combo = await comboService.getComboById(promotion.combo._id);

    let content;
    try {
      content = await generatePromotionContent(combo, promotion.channel);
    } catch {
      content = {
        title: `${combo.name} - ¡Oferta especial!`,
        text: `¡Aprovechá el combo ${combo.name}! Por solo $${combo.comboPrice} te llevás todos los productos. Ahorrás $${combo.discount} respecto al precio regular.`,
        cta: "¡Compralo ahora!",
        hashtags: ["ofertas", "minimercado", "ahorro", promotion.channel],
      };
    }

    await promotionService.updateGeneratedContent(promotion._id, content);
    const updated = await promotionService.getPromotionById(promotion._id);

    try {
      await n8nEvents.emitComboPromotionRequested(updated, combo);
    } catch {
      // n8n no disponible
    }

    res.json({ status: "success", promotion: updated });
  } catch (error) {
    next(error);
  }
};
