import * as promotionDao from "../dao/promotionDao.js";

export const create = async (data) => promotionDao.createPromotion(data);

export const findById = async (id) => promotionDao.findPromotionById(id);

export const findAll = async (filter, options) => promotionDao.findAllPromotions(filter, options);

export const update = async (id, data) => promotionDao.updatePromotion(id, data);

export const count = async (filter) => promotionDao.countPromotions(filter);

export const remove = async (id) => promotionDao.deletePromotion(id);
