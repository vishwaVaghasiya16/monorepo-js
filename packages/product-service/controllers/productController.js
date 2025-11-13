import Product from "../models/Product.js";
import { logger, HTTP_STATUS, ProductStatus } from "@monorepo/common";

/**
 * Get all products
 */
export const getProducts = async (req, res, next) => {
  try {
    const { status, category, page, limit } = req.query;
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
};

/**
 * Get product by ID
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

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
};

/**
 * Create product
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, status } = req.body;

    const product = new Product({
      name,
      description,
      price,
      stock: stock || 0,
      category,
      status,
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
};

/**
 * Update product
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(id, updateData, {
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
};

/**
 * Delete product
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

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
};

/**
 * Check product availability
 */
export const checkProductAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.query;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: "Product not found" },
      });
    }

    const available =
      product.stock >= parseInt(quantity) &&
      product.status === ProductStatus.ACTIVE;

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
};
