import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    combo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Combo",
      required: true,
    },
    channel: {
      type: String,
      enum: ["instagram", "facebook", "whatsapp"],
      required: [true, "El canal es requerido"],
    },
    generatedContent: {
      title: { type: String, default: "" },
      text: { type: String, default: "" },
      cta: { type: String, default: "" },
      hashtags: { type: [String], default: [] },
      imageUrl: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["pending", "generated", "approved", "published", "rejected", "failed"],
      default: "pending",
    },
    n8nWorkflowId: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    externalId: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

promotionSchema.index({ combo: 1 });
promotionSchema.index({ status: 1 });

export default mongoose.model("Promotion", promotionSchema);
