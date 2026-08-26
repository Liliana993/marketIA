import Sale from "../models/Sale.js";

export const createSale = async (data) => {
  return Sale.create(data);
};

export const findSaleById = async (id) => {
  return Sale.findById(id).populate("items.product");
};

export const findAllSales = async (filter = {}, options = {}) => {
  const { skip = 0, limit = 50 } = options;
  return Sale.find(filter).populate("items.product").sort({ createdAt: -1 }).skip(skip).limit(limit);
};

export const countSales = async (filter = {}) => {
  return Sale.countDocuments(filter);
};

export const getTopSellingProducts = async (limit = 10) => {
  return Sale.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.subtotal" },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  ]);
};

export const getSalesByDate = async (startDate, endDate) => {
  return Sale.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        totalSales: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

export const getTotalSalesByPeriod = async (startDate, endDate) => {
  const result = await Sale.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
  ]);
  return result[0] || { total: 0, count: 0 };
};

export const deleteSale = async (id) => {
  return Sale.findByIdAndDelete(id);
};
