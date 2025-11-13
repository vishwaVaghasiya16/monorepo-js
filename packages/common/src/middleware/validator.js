import Joi from "joi";
import { HTTP_STATUS } from "../constants.js";
import logger from "../logger.js";

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} source - Where to validate: 'body', 'query', 'params'
 * @returns {Function} Express middleware
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      logger.warn(`Validation error: ${JSON.stringify(errors)}`);

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: "Validation error",
          details: errors,
        },
      });
    }

    // Replace the request data with validated and sanitized data
    req[source] = value;
    next();
  };
};
