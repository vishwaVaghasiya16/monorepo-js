import Joi from "joi";
import { OrderStatus } from "@monorepo/common";

// Shipping address schema
const shippingAddressSchema = Joi.object({
  street: Joi.string().trim().optional().allow(""),
  city: Joi.string().trim().optional().allow(""),
  state: Joi.string().trim().optional().allow(""),
  zipCode: Joi.string().trim().optional().allow(""),
  country: Joi.string().trim().optional().allow(""),
});

// Order item schema
const orderItemSchema = Joi.object({
  productId: Joi.string().required().messages({
    "string.empty": "Product ID is required",
    "any.required": "Product ID is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
});

// Create order validation schema
export const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    "array.min": "Order must have at least one item",
    "any.required": "Items are required",
  }),
  shippingAddress: shippingAddressSchema.optional(),
});

// Update order status validation schema
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .required()
    .messages({
      "any.only": `Status must be one of: ${Object.values(OrderStatus).join(
        ", "
      )}`,
      "any.required": "Status is required",
    }),
});

// Get orders query validation schema
export const getOrdersQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .optional()
    .messages({
      "any.only": `Status must be one of: ${Object.values(OrderStatus).join(
        ", "
      )}`,
    }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit must be at most 100",
  }),
});

// Get order by ID params validation schema
export const getOrderByIdParamsSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.empty": "Order ID is required",
    "any.required": "Order ID is required",
  }),
});

// Update order status params validation schema
export const updateOrderStatusParamsSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.empty": "Order ID is required",
    "any.required": "Order ID is required",
  }),
});

// Cancel order params validation schema
export const cancelOrderParamsSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.empty": "Order ID is required",
    "any.required": "Order ID is required",
  }),
});
