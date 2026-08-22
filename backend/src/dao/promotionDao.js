import Promotion from "../models/Promotion.js";

export const createPromotion = async (data) => {
  return Promotion.create(data);
};

export const findPromotionById = async (id) => {
  return Promotion.findById(id).populate({
    path: "combo",
    populate: { path: "items.product" },
  });
};

export const findAllPromotions = async (filter = {}, options = {}) => {
  const { skip = 0, limit = 50 } = options;
  return Promotion.find(filter)
    .populate({
      path: "combo",
      populate: { path: "items.product" },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const updatePromotion = async (id, data) => {
  return Promotion.findByIdAndUpdate(id, data, { returnDocument: 'after' }).populate({
    path: "combo",
    populate: { path: "items.product" },
  });
};

export const countPromotions = async (filter = {}) => {
  return Promotion.countDocuments(filter);
};

export const deletePromotion = async (id) => {
  return Promotion.findByIdAndDelete(id);
};
