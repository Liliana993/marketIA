import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import comboRoutes from "./routes/comboRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import assistantRoutes from "./routes/assistantRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/combos", comboRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/webhook", webhookRoutes);
app.use("/api/export", exportRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "MarketIA" });
});

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`MarketIA server running on port ${PORT}`);
  });
});