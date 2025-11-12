import jwt from "jsonwebtoken";
import { HTTP_STATUS, JWT_SECRET } from "../constants.js";
import logger from "../logger.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: { message: "No token provided" },
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { message: "Invalid or expired token" },
    });
  }
};
