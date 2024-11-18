import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import * as analyticsController from "../controllers/analyticsController.js";

const router = express.Router();

// API to get the total number of registered users
router.get(
  "/total-users",
  verifyToken,
  roleMiddleware(["admin"]),
  analyticsController.getTotalUsers
);

// API to get the total number of all ads
router.get(
  "/total-ads",
  verifyToken,
  roleMiddleware(["admin"]),
  analyticsController.getTotalAds
);

// API to get the total number of fertilizer ads
router.get(
  "/fertilizer-ads",
  verifyToken,
  roleMiddleware(["admin"]),
  analyticsController.getFertilizerAds
);

// API to get the total number of agrochemical ads
router.get(
  "/agrochemical-ads",
  verifyToken,
  roleMiddleware(["admin"]),
  analyticsController.getAgrochemicalAds
);

// API to get the total number of machinery ads
router.get(
  "/machinery-ads",
  verifyToken,
  roleMiddleware(["admin"]),
  analyticsController.getMachineryAds
);

// API to get the total number of planting material ads
router.get(
  "/planting-material-ads",
  verifyToken,
  roleMiddleware(["admin"]),
  analyticsController.getPlantingMaterialAds
);

// API to get growth data for a graph
router.get(
  "/growth-data",
  verifyToken,
  roleMiddleware(["admin"]),
  analyticsController.getGrowthData
);

// API to get the top 5 users who posted the most ads
router.get(
  "/top-users",
  verifyToken,
  roleMiddleware(["admin"]),
  analyticsController.getTopUsers
);

// API to get the top 5 ads with the highest view counts
router.get(
  "/top-ads",
  verifyToken,
  roleMiddleware(["admin"]),
  analyticsController.getTopAds
);

export default router;
