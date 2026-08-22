import * as promotionRepo from "../repositories/promotionRepository.js";
import * as comboRepo from "../repositories/comboRepository.js";

export const createPromotion = async (comboId, channel) => {
  const combo = await comboRepo.findById(comboId);
  if (!combo) {
    const error = new Error("Combo no encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (!combo.active) {
    const error = new Error("No se puede promocionar un combo inactivo");
    error.statusCode = 400;
    throw error;
  }

  return promotionRepo.create({
    combo: combo._id,
    channel,
    status: "pending",
  });
};

export const getPromotionById = async (id) => {
  const promotion = await promotionRepo.findById(id);
  if (!promotion) {
    const error = new Error("Promoción no encontrada");
    error.statusCode = 404;
    throw error;
  }
  return promotion;
};

export const getAllPromotions = async (query) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.channel) {
    filter.channel = query.channel;
  }

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 50;
  const skip = (page - 1) * limit;

  const promotions = await promotionRepo.findAll(filter, { skip, limit });
  const total = await promotionRepo.count(filter);

  return { promotions, total, page, totalPages: Math.ceil(total / limit) };
};

export const approvePromotion = async (id) => {
  const promotion = await promotionRepo.findById(id);
  if (!promotion) {
    const error = new Error("Promoción no encontrada");
    error.statusCode = 404;
    throw error;
  }

  if (promotion.status !== "generated") {
    const error = new Error("Solo se pueden aprobar promociones generadas");
    error.statusCode = 400;
    throw error;
  }

  return promotionRepo.update(id, {
    status: "approved",
    approvedAt: new Date(),
  });
};

export const rejectPromotion = async (id) => {
  const promotion = await promotionRepo.findById(id);
  if (!promotion) {
    const error = new Error("Promoción no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return promotionRepo.update(id, { status: "rejected" });
};

export const markAsPublished = async (id, externalId) => {
  return promotionRepo.update(id, {
    status: "published",
    publishedAt: new Date(),
    externalId,
  });
};

export const markAsFailed = async (id, errorMessage) => {
  return promotionRepo.update(id, {
    status: "failed",
    errorMessage,
  });
};

export const updateGeneratedContent = async (id, content) => {
  return promotionRepo.update(id, {
    status: "generated",
    generatedContent: content,
  });
};

export const deletePromotion = async (id) => {
  const promotion = await promotionRepo.findById(id);
  if (!promotion) {
    const error = new Error("Promoción no encontrada");
    error.statusCode = 404;
    throw error;
  }
  return promotionRepo.remove(id);
};
