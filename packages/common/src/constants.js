export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const SERVICE_PORTS = {
  AUTH: 3001,
  PRODUCT: 3002,
  ORDER: 3003,
};

export const SERVICE_URLS = {
  AUTH: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  PRODUCT: process.env.PRODUCT_SERVICE_URL || "http://localhost:3002",
  ORDER: process.env.ORDER_SERVICE_URL || "http://localhost:3003",
};

export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017";

export const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
