import db from "../config/db.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    // Extract query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "id";
    const order = req.query.order || "ASC";
    const isActive =
      req.query.isActive !== undefined ? req.query.isActive : null;

    // Calculate the offset for pagination
    const offset = (page - 1) * limit;

    // Build query based on filtering
    let query = "SELECT * FROM users";
    const queryParams = [];

    if (isActive !== null) {
      query += " WHERE is_active = ?";
      queryParams.push(isActive);
    }

    query += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    // Execute query
    const [rows] = await db.query(query, queryParams);

    res.status(200).json({
      status: "success",
      data: rows,
      page,
      limit,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch users", error });
  }
};

// Get a single user by ID
export const getUserById = async (req, res) => {
  try {
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

export default userController;
