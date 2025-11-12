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
import productRoutes from "./routes/products.js";

dotenv.config();

const app = express();
const PORT = SERVICE_PORTS.PRODUCT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "product-service" });
});

// Routes
app.use("/api/products", productRoutes);

// Error handler
app.use(errorHandler);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || MONGODB_URI;
    await mongoose.connect(mongoUri, {
      dbName: "product_db",
    });
    logger.info("Product Service: Connected to MongoDB");
  } catch (error) {
    logger.error("Product Service: MongoDB connection error:", error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Product Service running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  logger.error("Failed to start Product Service:", error);
  process.exit(1);
});
