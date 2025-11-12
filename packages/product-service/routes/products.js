import express from "express";
import Product from "../models/Product.js";
import { logger, HTTP_STATUS } from "@monorepo/common";

const router = express.Router();

// Get all products
router.get("/", async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get product by ID
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: "Product not found" },
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: "Invalid product ID" },
      });
    }
    next(error);
  }
});

// Create product
router.post("/", async (req, res, next) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name || price === undefined) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: "Name and price are required" },
      });
    }

    const product = new Product({
      name,
      description,
      price,
      stock: stock || 0,
      category,
    });

    await product.save();
    logger.info(`Product created: ${product.name} (${product._id})`);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
});

// Update product
router.put("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: "Product not found" },
      });
    }

    logger.info(`Product updated: ${product.name} (${product._id})`);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: "Invalid product ID" },
      });
    }
    next(error);
  }
});

// Delete product
router.delete("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: "Product not found" },
      });
    }

    logger.info(`Product deleted: ${product.name} (${product._id})`);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { message: "Product deleted successfully" },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: "Invalid product ID" },
      });
    }
    next(error);
  }
});

// Check product availability (for inter-service communication)
router.get("/:id/availability", async (req, res, next) => {
  try {
    const { quantity = 1 } = req.query;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: "Product not found" },
      });
    }

    const available =
      product.stock >= parseInt(quantity) && product.status === "active";

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        available,
        productId: product._id,
        stock: product.stock,
        requestedQuantity: parseInt(quantity),
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: "Invalid product ID" },
      });
    }
    next(error);
  }
});

export default router;
