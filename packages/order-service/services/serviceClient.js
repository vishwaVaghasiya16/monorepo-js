import axios from "axios";
import { logger, SERVICE_URLS } from "@monorepo/common";

class ServiceClient {
  constructor() {
    this.authServiceUrl = SERVICE_URLS.AUTH;
    this.productServiceUrl = SERVICE_URLS.PRODUCT;
  }

  // Verify token with Auth Service
  async verifyToken(token) {
    try {
      const response = await axios.get(`${this.authServiceUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      logger.error(
        "Auth service error:",
        error.response?.data || error.message
      );
      throw new Error("Token verification failed");
    }
  }

  // Get product details from Product Service
  async getProduct(productId) {
    try {
      const response = await axios.get(
        `${this.productServiceUrl}/api/products/${productId}`
      );
      return response.data;
    } catch (error) {
      logger.error(
        "Product service error:",
        error.response?.data || error.message
      );
      throw new Error(`Failed to fetch product: ${productId}`);
    }
  }

  // Check product availability
  async checkProductAvailability(productId, quantity) {
    try {
      const response = await axios.get(
        `${this.productServiceUrl}/api/products/${productId}/availability`,
        { params: { quantity } }
      );
      return response.data;
    } catch (error) {
      logger.error(
        "Product availability check error:",
        error.response?.data || error.message
      );
      throw new Error(`Failed to check product availability: ${productId}`);
    }
  }

  // Update product stock (for order processing)
  async updateProductStock(productId, quantityChange) {
    try {
      const product = await this.getProduct(productId);
      const newStock = Math.max(0, product.data.product.stock + quantityChange);

      const response = await axios.put(
        `${this.productServiceUrl}/api/products/${productId}`,
        { stock: newStock }
      );
      return response.data;
    } catch (error) {
      logger.error(
        "Product stock update error:",
        error.response?.data || error.message
      );
      throw new Error(`Failed to update product stock: ${productId}`);
    }
  }
}

export default new ServiceClient();
