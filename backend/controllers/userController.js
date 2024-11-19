import db from "../config/db.js";

// // Get all users
// export const getAllUsers = async (req, res) => {
//   try {
//     // Extract query parameters with defaults
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const sortBy = req.query.sortBy || "id";
//     const order = req.query.order || "ASC";
//     const isActive =
//       req.query.isActive !== undefined ? req.query.isActive : null;

//     // Calculate the offset for pagination
//     const offset = (page - 1) * limit;

//     // Build query based on filtering
//     let query = "SELECT * FROM users";
//     const queryParams = [];

//     if (isActive !== null) {
//       query += " WHERE is_active = ?";
//       queryParams.push(isActive);
//     }

//     query += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
//     queryParams.push(limit, offset);

//     // Execute query
//     const [rows] = await db.query(query, queryParams);

//     res.status(200).json({
//       status: "success",
//       data: rows,
//       page,
//       limit,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ status: "error", message: "Failed to fetch users", error });
//   }
// };

// // Get all users with advertisement counts
// export const getAllUsersWithAdCounts = async (req, res) => {
//   try {
//     // Extract query parameters with defaults
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 12;
//     const sortBy = req.query.sortBy || "id";
//     const order = req.query.order || "ASC";
//     const isActive =
//       req.query.isActive !== undefined ? req.query.isActive : null;

//     // Calculate the offset for pagination
//     const offset = (page - 1) * limit;

//     // Build query with advertisement count
//     let query = `
//       SELECT
//         u.id,
//         u.name,
//         u.email,
//         u.image_url,
//         u.is_active,
//         COUNT(a.id) AS advertisement_count
//       FROM
//         users u
//       LEFT JOIN
//         advertisements a ON u.id = a.user_id
//     `;

//     const queryParams = [];

//     if (isActive !== null) {
//       query += " WHERE u.is_active = ?";
//       queryParams.push(isActive);
//     }

//     query += ` GROUP BY u.id ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
//     queryParams.push(limit, offset);

//     // Execute query
//     const [rows] = await db.query(query, queryParams);

//     res.status(200).json({
//       status: "success",
//       data: rows,
//       page,
//       limit,
//     });
//   } catch (error) {
//     console.error("Error fetching users with advertisement counts:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Failed to fetch users with advertisement counts",
//       error,
//     });
//   }
// };
// import db from "../config/db.js";

// Helper function to validate pagination parameters
const validatePaginationParams = (page, limit) => {
  // Ensure page and limit are positive integers
  if (isNaN(page) || page <= 0) {
    return { valid: false, message: "Invalid page number" };
  }
  if (isNaN(limit) || limit <= 0) {
    return { valid: false, message: "Invalid limit number" };
  }
  return { valid: true };
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const sortBy = req.query.sortBy || "id";
    const order = req.query.order || "ASC";
    const isActive =
      req.query.isActive !== undefined ? req.query.isActive : null;

    // Validate pagination parameters
    const { valid, message } = validatePaginationParams(page, limit);
    if (!valid) {
      return res.status(400).json({ status: "error", message });
    }

    const offset = (page - 1) * limit;

    let query = "SELECT * FROM users";
    const queryParams = [];

    if (isActive !== null) {
      query += " WHERE is_active = ?";
      queryParams.push(isActive);
    }

    // Get the total count of users
    const [countResult] = await db.query(
      "SELECT COUNT(*) AS totalItems FROM users",
      queryParams
    );
    const totalItems = countResult[0].totalItems;

    query += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    console.log("Executing query:", query);
    console.log("With parameters:", queryParams);

    const [rows] = await db.query(query, queryParams);

    // Calculate the total pages
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      status: "success",
      data: rows,
      page,
      limit,
      totalItems,
      totalPages, // Send total pages along with the data
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch users", error });
  }
};

// Get all users with advertisement counts
export const getAllUsersWithAdCounts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const sortBy = req.query.sortBy || "id";
    const order = req.query.order || "ASC";
    const isActive =
      req.query.isActive !== undefined ? req.query.isActive : null;

    // Validate pagination parameters
    const { valid, message } = validatePaginationParams(page, limit);
    if (!valid) {
      return res.status(400).json({ status: "error", message });
    }

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.image_url, 
        u.is_active, 
        COUNT(a.id) AS advertisement_count
      FROM 
        users u
      LEFT JOIN 
        advertisements a ON u.id = a.user_id
    `;
    const queryParams = [];

    if (isActive !== null) {
      query += " WHERE u.is_active = ?";
      queryParams.push(isActive);
    }

    query += ` GROUP BY u.id ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    // Get the total count of users with advertisements
    const [countResult] = await db.query(
      `
      SELECT COUNT(DISTINCT u.id) AS totalItems
      FROM users u
      LEFT JOIN advertisements a ON u.id = a.user_id
      ${isActive !== null ? "WHERE u.is_active = ?" : ""}
    `,
      queryParams
    );
    const totalItems = countResult[0].totalItems;

    console.log("Executing query:", query);
    console.log("With parameters:", queryParams);

    const [rows] = await db.query(query, queryParams);

    // Calculate the total pages
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      status: "success",
      data: rows,
      page,
      limit,
      totalItems,
      totalPages, // Send total pages along with the data
    });
  } catch (error) {
    console.error("Error fetching users with advertisement counts:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch users with advertisement counts",
      error,
    });
  }
};

// Get a single user by ID
export const getUserById = async (req, res) => {
  try {
    console.log("Request Parameters:", req.params); // Log parameters
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid user ID format" });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res.status(200).json({ status: "success", data: rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch user", error });
  }
};
// Deactivate a user (soft delete)
export const deactivateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid user ID format" });
    }

    const reason = req.body.reason || "No reason provided";

    // Check if the user exists
    const [userCheck] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (userCheck.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    } else if (!userCheck[0].is_active) {
      return res
        .status(400)
        .json({ status: "error", message: "Already deactivated" });
    }

    // Deactivate user
    await db.query(
      "UPDATE users SET is_active = 0, deactivation_reason = ? WHERE id = ?",
      [reason, userId]
    );
    res
      .status(200)
      .json({ status: "success", message: "User deactivated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to deactivate user", error });
  }
};

// Reactivate deactivated users
export const reactivateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid user ID format" });
    }

    // Get activation reason from request body, or set a default message
    const activationReason = req.body.reason || "No reason provided";

    // Check if the user exists and is currently deactivated
    const [userCheck] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (userCheck.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    } else if (userCheck[0].is_active) {
      return res
        .status(400)
        .json({ status: "error", message: "User is already active" });
    }

    // Reactivate the user and set the activation reason
    await db.query(
      "UPDATE users SET is_active = 1, deactivation_reason = NULL, activation_reason = ? WHERE id = ?",
      [activationReason, userId]
    );

    res
      .status(200)
      .json({ status: "success", message: "User reactivated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to reactivate user", error });
  }
};

// Permanently delete a user
export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid user ID format" });
    }

    // Check if the user exists
    const [userCheck] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (userCheck.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // Perform the hard delete if the user exists
    await db.query("DELETE FROM users WHERE id = ?", [userId]);
    res
      .status(200)
      .json({ status: "success", message: "User permanently deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to delete user", error });
  }
};
