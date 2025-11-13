import express from "express";
import { authMiddleware, validate } from "@monorepo/common";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  getOrdersQuerySchema,
  getOrderByIdParamsSchema,
  updateOrderStatusParamsSchema,
  cancelOrderParamsSchema,
} from "../validations/orderValidation.js";
import * as orderController from "../controllers/orderController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all orders for the authenticated user
router.get(
  "/",
  validate(getOrdersQuerySchema, "query"),
  orderController.getOrders
);

// Get order by ID
router.get(
  "/:id",
  validate(getOrderByIdParamsSchema, "params"),
  orderController.getOrderById
);

// Create new order
router.post(
  "/",
  validate(createOrderSchema, "body"),
  orderController.createOrder
);

// Update order status
router.patch(
  "/:id/status",
  validate(updateOrderStatusParamsSchema, "params"),
  validate(updateOrderStatusSchema, "body"),
  orderController.updateOrderStatus
);

// Cancel order
router.post(
  "/:id/cancel",
  validate(cancelOrderParamsSchema, "params"),
  orderController.cancelOrder
);

export default router;
