import express from "express";
import { validate } from "@monorepo/common";
import {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
  getProductByIdParamsSchema,
  checkAvailabilityQuerySchema,
  checkAvailabilityParamsSchema,
  updateProductParamsSchema,
  deleteProductParamsSchema,
} from "../validations/productValidation.js";
import * as productController from "../controllers/productController.js";

const router = express.Router();

// Get all products
router.get(
  "/",
  validate(getProductsQuerySchema, "query"),
  productController.getProducts
);

// Check product availability (for inter-service communication)
// This route must come before /:id to avoid route conflicts
router.get(
  "/:id/availability",
  validate(checkAvailabilityParamsSchema, "params"),
  validate(checkAvailabilityQuerySchema, "query"),
  productController.checkProductAvailability
);

// Get product by ID
router.get(
  "/:id",
  validate(getProductByIdParamsSchema, "params"),
  productController.getProductById
);

// Create product
router.post(
  "/",
  validate(createProductSchema, "body"),
  productController.createProduct
);

// Update product
router.put(
  "/:id",
  validate(updateProductParamsSchema, "params"),
  validate(updateProductSchema, "body"),
  productController.updateProduct
);

// Delete product
router.delete(
  "/:id",
  validate(deleteProductParamsSchema, "params"),
  productController.deleteProduct
);

export default router;
