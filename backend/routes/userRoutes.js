import express from "express";
import * as userController from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get all users
router.get("/", verifyToken, userController.getAllUsers);

// Get a single user by ID
router.get("/:id", verifyToken, userController.getUserById);

// Deactivate (soft delete) a user
router.put(
  "/deactivate/:id",
  verifyToken,
  roleMiddleware(["admin"]),
  userController.deactivateUser
);

// Activate (soft delete) a user
router.put(
  "/activate/:id",
  verifyToken,
  roleMiddleware(["admin"]),
  userController.reactivateUser
);

// Permanently delete a user
router.delete(
  "/:id",
  verifyToken,
  roleMiddleware(["admin"]),
  userController.deleteUser
);

export default router;
