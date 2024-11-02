import express from "express";
import authController from "../controllers/authController.js";
import {
  validateRequest,
  signupValidation,
  loginValidation,
  updateProfileValidation,
  updateRoleValidation,
  updatePasswordValidation,
} from "../middleware/validation.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin dashboard user routes
router.post(
  "/signup",
  signupValidation,
  validateRequest,
  authController.signup
);
router.post("/login", loginValidation, validateRequest, authController.login);

// Profile update route with validation
router.put(
  "/profile",
  verifyToken,
  updateProfileValidation,
  validateRequest,
  authController.updateProfile
);
router.put(
  "/profile/:id",
  verifyToken,
  roleMiddleware(["admin"]),
  updateRoleValidation,
  validateRequest,
  authController.updateUserRole
);

// Password update route with validation
router.put(
  "/password",
  verifyToken,
  updatePasswordValidation,
  validateRequest,
  authController.updatePassword
);

// Account deactivation route
router.put(
  "/account/:id",
  verifyToken,
  roleMiddleware(["admin"]),
  authController.deleteAccount
);

// Logout route
router.post("/logout", verifyToken, authController.logout);

export default router;
