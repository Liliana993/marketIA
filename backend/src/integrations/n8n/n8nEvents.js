import * as n8nClient from "./n8nClient.js";

export const emitComboPromotionRequested = async (promotion, combo) => {
  const payload = {
    event: "combo.promotion_requested",
    promotionId: promotion._id.toString(),
    comboId: combo._id.toString(),
    name: combo.name,
    description: combo.description,
    products: combo.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.salePrice,
    })),
    regularPrice: combo.regularPrice,
    comboPrice: combo.comboPrice,
    discount: combo.discount,
    channel: promotion.channel,
  };

  return n8nClient.sendWebhook("/combo-promotion", payload);
};

export const emitPromotionApproved = async (promotion, combo) => {
  const payload = {
    event: "promotion.approved",
    promotionId: promotion._id.toString(),
    comboId: combo._id.toString(),
    comboName: combo.name,
    channel: promotion.channel,
    content: promotion.generatedContent,
  };

  return n8nClient.sendWebhook("/promotion-approved", payload);
};

export const emitStockLow = async (product) => {
  const payload = {
    event: "stock.low",
    productId: product._id.toString(),
    productName: product.name,
    currentStock: product.stock,
    minimumStock: product.minimumStock,
  };

  return n8nClient.sendWebhook("/stock-alert", payload);
};
