// api/index.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import authRouter from "./auth";
import clientsRouter from "./clients";
import visitsRouter from "../client/src/pages/visits";
import depotsRouter from "../client/src/pages/depots";
import missedOrdersRouter from "../client/src/pages/missedOrders";
import trainingLogsRouter from "../client/src/pages/trainingLogs";
import productComplaintsRouter from "../client/src/pages/Complaints";

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Health
app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/clients", clientsRouter);
//app.use("/api/visits", visitsRouter);
//app.use("/api/depots", depotsRouter);
//app.use("/api/missed-orders", missedOrdersRouter);
//app.use("/api/training-logs", trainingLogsRouter);
//app.use("/api/product-complaints", productComplaintsRouter);

// 404 for unknown API routes
app.use("/api/*", (_req, res) => {
  res.status(404).json({ error: "API route not found" });
});

export default app;