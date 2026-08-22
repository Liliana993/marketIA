import * as saleService from "../services/saleService.js";

export const getSales = async (req, res, next) => {
  try {
    const result = await saleService.getAllSales(req.query);
    res.json({ status: "success", ...result });
  } catch (error) {
    next(error);
  }
};

export const getSaleById = async (req, res, next) => {
  try {
    const sale = await saleService.getSaleById(req.params.id);
    res.json({ status: "success", sale });
  } catch (error) {
    next(error);
  }
};

export const createSale = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "La venta debe tener al menos un producto",
      });
    }

    for (const item of items) {
      if (!item.product || !item.quantity) {
        return res.status(400).json({
          status: "error",
          message: "Cada item debe tener producto y cantidad",
        });
      }
    }

    const sale = await saleService.createSale(items);
    res.status(201).json({ status: "success", sale });
  } catch (error) {
    next(error);
  }
};

export const getSalesStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate + "T23:59:59.999Z") : now;

    const [topSelling, salesByDate, totalSales] = await Promise.all([
      saleService.getTopSellingProducts(10),
      saleService.getSalesByDate(start, end),
      saleService.getTotalSalesByPeriod(start, end),
    ]);

    res.json({
      status: "success",
      topSelling,
      salesByDate,
      totalSales,
    });
  } catch (error) {
    next(error);
  }
};
