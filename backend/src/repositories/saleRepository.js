import * as saleDao from "../dao/saleDao.js";

export const create = async (data) => saleDao.createSale(data);

export const findById = async (id) => saleDao.findSaleById(id);

export const findAll = async (filter, options) => saleDao.findAllSales(filter, options);

export const count = async (filter) => saleDao.countSales(filter);

export const getTopSellingProducts = async (limit) => saleDao.getTopSellingProducts(limit);

export const getSalesByDate = async (startDate, endDate) => saleDao.getSalesByDate(startDate, endDate);

export const getTotalSalesByPeriod = async (startDate, endDate) => saleDao.getTotalSalesByPeriod(startDate, endDate);
