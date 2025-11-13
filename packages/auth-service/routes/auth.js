import express from "express";
import { validate } from "@monorepo/common";
import { registerSchema, loginSchema } from "../validations/authValidation.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Register
router.post(
  "/register",
  validate(registerSchema, "body"),
  authController.register
);

// Login
router.post("/login", validate(loginSchema, "body"), authController.login);

// Get current user (protected route)
router.get("/me", authController.getCurrentUser);

export default router;
