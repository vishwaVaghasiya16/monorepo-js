// Common type definitions and validation schemas

export const UserRole = {
  ADMIN: "admin",
  USER: "user",
  CUSTOMER: "customer",
};

export const OrderStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ProductStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  OUT_OF_STOCK: "out_of_stock",
};
