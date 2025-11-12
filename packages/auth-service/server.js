import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import {
  logger,
  errorHandler,
  HTTP_STATUS,
  SERVICE_PORTS,
  MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
} from "@monorepo/common";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = SERVICE_PORTS.AUTH;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

// Routes
app.use("/api/auth", authRoutes);

// Error handler
app.use(errorHandler);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || MONGODB_URI;
    await mongoose.connect(mongoUri, {
      dbName: "auth_db",
    });
    logger.info("Auth Service: Connected to MongoDB");
  } catch (error) {
    logger.error("Auth Service: MongoDB connection error:", error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Auth Service running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  logger.error("Failed to start Auth Service:", error);
  process.exit(1);
});
