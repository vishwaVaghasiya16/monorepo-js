import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import {
  logger,
  errorHandler,
  HTTP_STATUS,
  SERVICE_PORTS,
  MONGODB_URI,
} from "@monorepo/common";
import orderRoutes from "./routes/orders.js";

dotenv.config();

const app = express();
const PORT = SERVICE_PORTS.ORDER;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "order-service" });
});

// Routes
app.use("/api/orders", orderRoutes);

// Error handler
app.use(errorHandler);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || MONGODB_URI;
    await mongoose.connect(mongoUri, {
      dbName: "order_db",
    });
    logger.info("Order Service: Connected to MongoDB");
  } catch (error) {
    logger.error("Order Service: MongoDB connection error:", error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Order Service running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  logger.error("Failed to start Order Service:", error);
  process.exit(1);
});
