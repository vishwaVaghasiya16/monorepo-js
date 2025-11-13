import Order from "../models/Order.js";
import { authMiddleware } from "@monorepo/common";
import { logger, HTTP_STATUS, OrderStatus } from "@monorepo/common";
import serviceClient from "../services/serviceClient.js";

/**
 * Get all orders for the authenticated user
 */
export const getOrders = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const query = { userId: req.user.userId };

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        orders,
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
 * Get order by ID
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!order) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: "Order not found" },
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: "Invalid order ID" },
      });
    }
    next(error);
  }
};

/**
 * Create new order
 */
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    // Validate and fetch product details
    const orderItems = [];
    for (const item of items) {
      const { productId, quantity } = item;

      // Check product availability
      const availability = await serviceClient.checkProductAvailability(
        productId,
        quantity
      );
      if (!availability.data.available) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: `Product ${productId} is not available in requested quantity`,
            productId,
            availableStock: availability.data.stock,
            requestedQuantity: quantity,
          },
        });
      }

      // Get product details
      const productData = await serviceClient.getProduct(productId);
      const product = productData.data.product;

      orderItems.push({
        productId,
        productName: product.name,
        quantity,
        price: product.price,
        subtotal: product.price * quantity,
      });
    }

    // Create order
    const order = new Order({
      userId: req.user.userId,
      items: orderItems,
      shippingAddress,
      status: OrderStatus.PENDING,
    });

    await order.save();

    // Update product stocks
    for (const item of items) {
      try {
        await serviceClient.updateProductStock(item.productId, -item.quantity);
      } catch (error) {
        logger.error(
          `Failed to update stock for product ${item.productId}:`,
          error
        );
        // Continue with other products even if one fails
      }
    }

    logger.info(`Order created: ${order._id} by user ${req.user.userId}`);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!order) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: "Order not found" },
      });
    }

    order.status = status;
    await order.save();

    logger.info(`Order status updated: ${order._id} -> ${status}`);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: "Invalid order ID" },
      });
    }
    next(error);
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!order) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: "Order not found" },
      });
    }

    if (order.status === OrderStatus.CANCELLED) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: "Order is already cancelled" },
      });
    }

    if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: "Cannot cancel order that is already shipped or delivered",
        },
      });
    }

    // Restore product stocks
    for (const item of order.items) {
      try {
        await serviceClient.updateProductStock(item.productId, item.quantity);
      } catch (error) {
        logger.error(
          `Failed to restore stock for product ${item.productId}:`,
          error
        );
      }
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();

    logger.info(`Order cancelled: ${order._id}`);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: "Invalid order ID" },
      });
    }
    next(error);
  }
};
