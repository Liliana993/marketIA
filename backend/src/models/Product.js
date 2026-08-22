import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del producto es requerido"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "La categoría es requerida"],
    },
    purchasePrice: {
      type: Number,
      required: [true, "El precio de compra es requerido"],
      min: [0, "El precio de compra no puede ser negativo"],
    },
    salePrice: {
      type: Number,
      required: [true, "El precio de venta es requerido"],
      min: [0, "El precio de venta no puede ser negativo"],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "El stock no puede ser negativo"],
      default: 0,
    },
    minimumStock: {
      type: Number,
      required: [true, "El stock mínimo es requerido"],
      min: [0, "El stock mínimo no puede ser negativo"],
      default: 0,
    },
    unit: {
      type: String,
      enum: ["unit", "kg", "g", "l", "ml", "package"],
      default: "unit",
    },
    sku: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });

export default mongoose.model("Product", productSchema);
