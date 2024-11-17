import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import * as reportController from "../controllers/reportController.js";

const router = express.Router();

// Route to get all reports
router.get(
  "/",
  verifyToken,
  roleMiddleware(["admin"]), // Ensures that only admins can access this route
  reportController.getAllReports
);

export default router;