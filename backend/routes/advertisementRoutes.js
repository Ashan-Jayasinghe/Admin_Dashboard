import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import * as advertisementController from "../controllers/advertisementController.js";

const router = express.Router();

// Route to get advertisements by category
router.get(
  "/",
  verifyToken,
  advertisementController.getAdvertisementsByCategory
);
router.get("/all", verifyToken, advertisementController.getAllAdvertisements);
router.delete(
  "/:id",
  verifyToken,
  roleMiddleware(["admin"]),
  advertisementController.deleteAdvertisement
);
router.put(
  "/deactivate/:id",
  verifyToken,
  roleMiddleware(["admin"]),
  advertisementController.deactivateAdvertisement
);
router.put(
  "/activate/:id",
  verifyToken,
  roleMiddleware(["admin"]),
  advertisementController.reactivateAdvertisement
);

export default router;
