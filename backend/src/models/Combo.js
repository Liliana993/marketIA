import mongoose from "mongoose";

const comboItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "La cantidad debe ser al menos 1"],
    },
  },
  { _id: false }
);

const comboSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del combo es requerido"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    items: {
      type: [comboItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "El combo debe tener al menos un producto",
      },
    },
    regularPrice: {
      type: Number,
      min: [0, "El precio regular no puede ser negativo"],
      default: 0,
    },
    comboPrice: {
      type: Number,
      required: [true, "El precio del combo es requerido"],
      min: [0, "El precio del combo no puede ser negativo"],
    },
    discount: {
      type: Number,
      min: [0, "El descuento no puede ser negativo"],
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Combo", comboSchema);
