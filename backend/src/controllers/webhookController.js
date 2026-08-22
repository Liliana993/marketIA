import * as promotionService from "../services/promotionService.js";

export const handlePromotionResult = async (req, res, next) => {
  try {
    const { promotionId, status, content, error: errorMsg } = req.body;

    if (!promotionId) {
      return res.status(400).json({ status: "error", message: "promotionId is required" });
    }

    if (status === "generated" && content) {
      await promotionService.updateGeneratedContent(promotionId, content);
    } else if (status === "failed") {
      await promotionService.markAsFailed(promotionId, errorMsg || "Error al generar contenido");
    }

    res.json({ status: "success" });
  } catch (error) {
    next(error);
  }
};

export const handlePublicationResult = async (req, res, next) => {
  try {
    const { promotionId, status, externalId, error: errorMsg } = req.body;

    if (!promotionId) {
      return res.status(400).json({ status: "error", message: "promotionId is required" });
    }

    if (status === "published") {
      await promotionService.markAsPublished(promotionId, externalId);
    } else if (status === "failed") {
      await promotionService.markAsFailed(promotionId, errorMsg || "Error al publicar");
    }

    res.json({ status: "success" });
  } catch (error) {
    next(error);
  }
};
