import Joi from "joi";
import { ProductStatus } from "@monorepo/common";

// Create product validation schema
export const createProductSchema = Joi.object({
  name: Joi.string().trim().max(200).required().messages({
    "string.empty": "Product name is required",
    "string.max": "Product name must be at most 200 characters long",
    "any.required": "Product name is required",
  }),
  description: Joi.string().trim().max(1000).allow("").optional().messages({
    "string.max": "Description must be at most 1000 characters long",
  }),
  price: Joi.number().min(0).required().messages({
    "number.base": "Price must be a number",
    "number.min": "Price must be greater than or equal to 0",
    "any.required": "Price is required",
  }),
  stock: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Stock must be a number",
    "number.integer": "Stock must be an integer",
    "number.min": "Stock must be greater than or equal to 0",
  }),
  category: Joi.string().trim().allow("").optional(),
  status: Joi.string()
    .valid(...Object.values(ProductStatus))
    .optional()
    .messages({
      "any.only": `Status must be one of: ${Object.values(ProductStatus).join(
        ", "
      )}`,
    }),
});

// Update product validation schema
export const updateProductSchema = Joi.object({
  name: Joi.string().trim().max(200).optional().messages({
    "string.max": "Product name must be at most 200 characters long",
  }),
  description: Joi.string().trim().max(1000).allow("").optional().messages({
    "string.max": "Description must be at most 1000 characters long",
  }),
  price: Joi.number().min(0).optional().messages({
    "number.base": "Price must be a number",
    "number.min": "Price must be greater than or equal to 0",
  }),
  stock: Joi.number().integer().min(0).optional().messages({
    "number.base": "Stock must be a number",
    "number.integer": "Stock must be an integer",
    "number.min": "Stock must be greater than or equal to 0",
  }),
  category: Joi.string().trim().allow("").optional(),
  status: Joi.string()
    .valid(...Object.values(ProductStatus))
    .optional()
    .messages({
      "any.only": `Status must be one of: ${Object.values(ProductStatus).join(
        ", "
      )}`,
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required for update",
  });

// Get products query validation schema
export const getProductsQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ProductStatus))
    .optional()
    .messages({
      "any.only": `Status must be one of: ${Object.values(ProductStatus).join(
        ", "
      )}`,
    }),
  category: Joi.string().trim().optional(),
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

// Get product by ID params validation schema
export const getProductByIdParamsSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.empty": "Product ID is required",
    "any.required": "Product ID is required",
  }),
});

// Check product availability query validation schema
export const checkAvailabilityQuerySchema = Joi.object({
  quantity: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
  }),
});

// Check product availability params validation schema
export const checkAvailabilityParamsSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.empty": "Product ID is required",
    "any.required": "Product ID is required",
  }),
});

// Update product params validation schema
export const updateProductParamsSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.empty": "Product ID is required",
    "any.required": "Product ID is required",
  }),
});

// Delete product params validation schema
export const deleteProductParamsSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.empty": "Product ID is required",
    "any.required": "Product ID is required",
  }),
});
