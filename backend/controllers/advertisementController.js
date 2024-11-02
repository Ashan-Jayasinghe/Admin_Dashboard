import db from "../config/db.js"; // Add .js if necessary

// Fetch ads by category and optional subcategory with unique attributes
export const getAdvertisementsByCategory = async (req, res) => {
  const category = req.query.category;
  const subcategory = req.query.subcategory; // Optional subcategory parameter
  const uploadPath =
    "http://localhost/Govi-Nena-Home-Garden-Advertisement-Module-Backend/";

  try {
    // Modify query to optionally include subcategory
    let adsQuery = `
      SELECT a.*, i.image_path
      FROM advertisements a
      LEFT JOIN advertisement_images i ON a.id = i.advertisement_id
      WHERE a.category = ? AND a.is_active = 1
    `;

    // Add subcategory to query if it's provided
    const queryParams = [category];
    if (subcategory) {
      adsQuery += ` AND a.subcategory = ?`;
      queryParams.push(subcategory);
    }

    const [adsRows] = await db.query(adsQuery, queryParams);

    const ads = {};
    adsRows.forEach((ad) => {
      ad.isExpired = new Date(ad.expires_at).getTime() < Date.now();
      const adId = ad.id;

      if (!ads[adId]) {
        ads[adId] = { ...ad, images: [] };
      }

      if (ad.image_path) {
        ads[adId].images.push(`${uploadPath}${ad.image_path}`);
      }
    });

    // Fetch unique attributes for each ad based on subcategory
    for (const adId in ads) {
      const ad = ads[adId];
      const subcategory = ad.subcategory;
      console.log(subcategory);
      let uniqueTable;
      switch (subcategory) {
        case "Inorganic":
          uniqueTable = "advertisement_inorganic";
          break;
        case "Organic":
          uniqueTable = "advertisement_organic";
          break;
        case "Pesticides":
          uniqueTable = "advertisement_pesticides";
          break;
        case "Plant Growth Regulators":
          uniqueTable = "advertisement_pgr";
          break;
        case "Seedlings":
          uniqueTable = "advertisement_seedlings";
          break;
        case "Seeds":
          uniqueTable = "advertisement_seeds";
          break;
        case "Tubers":
          uniqueTable = "advertisement_tuber";
          break;
        case "Dryers":
          uniqueTable = "advertisement_dryers";
          break;
        case "Harvesting Machines":
          uniqueTable = "advertisement_harvesting_machines";
          break;
        case "Tractors":
          uniqueTable = "advertisement_tractor";
          break;
        case "Tillages":
          uniqueTable = "advertisement_tillages";
          break;
        case "Sprayers":
          uniqueTable = "advertisement_sprayers";
          break;
        case "Planting Machines":
          uniqueTable = "advertisement_planting_machines";
          break;
        case "Others":
          uniqueTable = "advertisement_others";
          break;
        case "Irrigation Systems":
          uniqueTable = "advertisement_irrigation_systems";
          break;
        default:
          continue;
      }

      if (uniqueTable) {
        const uniqueAttributesQuery = `SELECT * FROM ${uniqueTable} WHERE advertisement_id = ?`;
        const [uniqueAttributes] = await db.query(uniqueAttributesQuery, [
          adId,
        ]);

        if (uniqueAttributes.length > 0) {
          Object.assign(ad, uniqueAttributes[0]);
        }
      }
    }

    res.status(200).json({ status: "success", data: Object.values(ads) });
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Failed to fetch advertisements",
        error,
      });
  }
};

export const getAllAdvertisements = async (req, res) => {
  const uploadPath =
    "http://localhost/Govi-Nena-Home-Garden-Advertisement-Module-Backend/";

  try {
    // Query to fetch all advertisements and images
    const adsQuery = `
      SELECT a.*, i.image_path
      FROM advertisements a
      LEFT JOIN advertisement_images i ON a.id = i.advertisement_id
      WHERE a.is_active = 1
    `;
    const [adsRows] = await db.query(adsQuery);

    // Organize ads and mark if expired
    const ads = {};
    adsRows.forEach((ad) => {
      ad.isExpired = new Date(ad.expires_at).getTime() < Date.now();
      const adId = ad.id;

      if (!ads[adId]) {
        ads[adId] = { ...ad, images: [] };
      }

      if (ad.image_path) {
        ads[adId].images.push(`${uploadPath}${ad.image_path}`);
      }
    });

    // Fetch unique attributes for each ad based on subcategory
    for (const adId in ads) {
      const ad = ads[adId];
      const subcategory = ad.subcategory;

      let uniqueTable;
      switch (subcategory) {
        case "Inorganic":
          uniqueTable = "advertisement_inorganic";
          break;
        case "Organic":
          uniqueTable = "advertisement_organic";
          break;
        case "Pesticides":
          uniqueTable = "advertisement_pesticides";
          break;
        case "Plant Growth Regulators":
          uniqueTable = "advertisement_pgr";
          break;
        case "Seedlings":
          uniqueTable = "advertisement_seedlings";
          break;
        case "Seeds":
          uniqueTable = "advertisement_seeds";
          break;
        case "Tubers":
          uniqueTable = "advertisement_tuber";
          break;
        case "Dryers":
          uniqueTable = "advertisement_dryers";
          break;
        case "Harvesting Machines":
          uniqueTable = "advertisement_harvesting_machines";
          break;
        case "Tractors":
          uniqueTable = "advertisement_tractor";
          break;
        case "Tillages":
          uniqueTable = "advertisement_tillages";
          break;
        case "Sprayers":
          uniqueTable = "advertisement_sprayers";
          break;
        case "Planting Machines":
          uniqueTable = "advertisement_planting_machines";
          break;
        case "Others":
          uniqueTable = "advertisement_others";
          break;
        case "Irrigation Systems":
          uniqueTable = "advertisement_irrigation_systems";
          break;
        default:
          continue;
      }

      if (uniqueTable) {
        const uniqueAttributesQuery = `SELECT * FROM ${uniqueTable} WHERE advertisement_id = ?`;
        const [uniqueAttributes] = await db.query(uniqueAttributesQuery, [
          adId,
        ]);

        // Add unique attributes to the ad
        if (uniqueAttributes.length > 0) {
          Object.assign(ad, uniqueAttributes[0]);
        }
      }
    }

    res.status(200).json({ status: "success", data: Object.values(ads) });
  } catch (error) {
    console.error("Error fetching all advertisements:", error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Failed to fetch advertisements",
        error,
      });
  }
};

export const deleteAdvertisement = async (req, res) => {
  const adId = req.params.id;

  // Establish a single connection for the transaction
  const connection = await db.getConnection();

  try {
    // Start the transaction
    await connection.beginTransaction();

    // Step 1: Attempt to delete related entries in saved_ads if they exist
    await connection.query("DELETE FROM saved_ads WHERE ad_id = ?", [adId]);

    // Step 2: Delete the advertisement itself
    const [deleteResult] = await connection.query(
      "DELETE FROM advertisements WHERE id = ?",
      [adId]
    );

    // Check if the advertisement was deleted
    if (deleteResult.affectedRows === 0) {
      // Rollback and respond if no advertisement was found with the given ID
      await connection.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Advertisement not found" });
    }

    // Commit the transaction if all deletions succeed
    await connection.commit();

    res
      .status(200)
      .json({
        status: "success",
        message:
          "Advertisement and related saved ads (if any) deleted successfully",
      });
  } catch (error) {
    // Rollback if any error occurs
    await connection.rollback();
    console.error("Error deleting advertisement:", error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Failed to delete advertisement",
        error,
      });
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
};

// Deactivate an advertisement
export const deactivateAdvertisement = async (req, res) => {
  const adId = req.params.id;

  try {
    // Step 1: Check if the advertisement exists and its current active status
    const [adResult] = await db.query(
      "SELECT is_active FROM advertisements WHERE id = ?",
      [adId]
    );

    // If no advertisement is found, return a 404 error
    if (adResult.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Advertisement not found" });
    }

    // If the advertisement is already deactivated, return a message indicating so
    if (adResult[0].is_active === 0) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Advertisement is already deactivated",
        });
    }

    // Step 2: Proceed to deactivate the advertisement by setting is_active to 0
    const [updateResult] = await db.query(
      "UPDATE advertisements SET is_active = 0 WHERE id = ?",
      [adId]
    );

    res
      .status(200)
      .json({
        status: "success",
        message: "Advertisement deactivated successfully",
      });
  } catch (error) {
    console.error("Error deactivating advertisement:", error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Failed to deactivate advertisement",
        error,
      });
  }
};

// Reactivate an advertisement
export const reactivateAdvertisement = async (req, res) => {
  const adId = req.params.id;

  try {
    // Step 1: Check if the advertisement exists and its current active status
    const [adResult] = await db.query(
      "SELECT is_active FROM advertisements WHERE id = ?",
      [adId]
    );

    // If no advertisement is found, return a 404 error
    if (adResult.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Advertisement not found" });
    }

    // If the advertisement is already active, return a message indicating so
    if (adResult[0].is_active === 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Advertisement is already active" });
    }

    // Step 2: Proceed to reactivate the advertisement by setting is_active to 1
    const [updateResult] = await db.query(
      "UPDATE advertisements SET is_active = 1 WHERE id = ?",
      [adId]
    );

    res
      .status(200)
      .json({
        status: "success",
        message: "Advertisement reactivated successfully",
      });
  } catch (error) {
    console.error("Error reactivating advertisement:", error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Failed to reactivate advertisement",
        error,
      });
  }
};


export default advertisementController;