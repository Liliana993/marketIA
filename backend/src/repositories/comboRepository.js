import * as comboDao from "../dao/comboDao.js";

export const create = async (data) => comboDao.createCombo(data);

export const findById = async (id) => comboDao.findComboById(id);

export const findAll = async (filter, options) => comboDao.findAllCombos(filter, options);

export const count = async (filter) => comboDao.countCombos(filter);

export const update = async (id, data) => comboDao.updateCombo(id, data);

export const remove = async (id) => comboDao.deleteCombo(id);

export const findActive = async () => comboDao.findActiveCombos();
