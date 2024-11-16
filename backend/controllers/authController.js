import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import {
  revokeToken,
  isTokenRevoked,
  revokeUserTokens,
  saveToken,
} from "../utils/tokenManagement.js";

// Function to get the user's profile information
export const getUserProfile = async (req, res) => {
  const userId = req.user.userId; // Assuming the user's ID is stored in the token

  try {
    // Fetch the user's details from the database, including created_at and updated_at
    const [user] = await db.query(
      "SELECT id, username, email, role, created_at, updated_at, image_url FROM admin_users WHERE id = ? AND is_active = 1",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Assuming images are stored in the 'uploads/profiles' folder
    const baseUrl = "http://localhost:5001";

    // Prepend the base URL to the image URL stored in the database
    const userProfile = user[0];
    if (userProfile.image_url) {
      userProfile.image_url = `${baseUrl}${userProfile.image_url}`;
    } else {
      userProfile.image_url = `${baseUrl}default.jpg`; // Provide a default image URL if none exists
    }

    // Return the user's profile information along with the complete image URL
    return res.status(200).json({
      status: "success",
      message: "User profile fetched successfully",
      user: userProfile, // Return the user profile with the full image URL
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch user profile",
      error,
    });
  }
};

// Signup function for registering a new admin user
export const signup = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if email or username already exists
    const [existingUser] = await db.query(
      "SELECT * FROM admin_users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Username or email already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user if no duplicate found
    await db.query(
      "INSERT INTO admin_users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role]
    );

    res
      .status(201)
      .json({ status: "success", message: "User registered successfully" });
  } catch (error) {
    console.error("Error in signup:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to register user", error });
  }
};

// Login function for authenticating admin users
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [userResult] = await db.query(
      "SELECT * FROM admin_users WHERE email = ? AND is_active =1",
      [email]
    );
    if (userResult.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const user = userResult[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Calculate expiration time for the token
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Save the token in the database
    await saveToken(user.id, token, expiresAt);

    res
      .status(200)
      .json({ status: "success", message: "Logged in successfully", token });
  } catch (error) {
    console.error("Error in login:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to login", error });
  }
};

// Function to update the user's profile (username and email)
export const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { username, email } = req.body;

  try {
    await db.query(
      "UPDATE admin_users SET username = ?, email = ? WHERE id = ?",
      [username, email, userId]
    );
    res
      .status(200)
      .json({ status: "success", message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to update profile", error });
  }
};

export const updateUserRole = async (req, res) => {
  const userId = req.params.id; // ID from URL
  const { role } = req.body; // New role from request body
  const requesterId = req.user.userId; // ID of the user making the request

  try {
    // Check if the user exists
    const [userExists] = await db.query(
      "SELECT 1 FROM admin_users WHERE id = ?",
      [userId]
    );

    // If the user doesn't exist, return an error response
    if (userExists.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "User not exist" });
    }

    // Proceed to update the role if the user exists
    await db.query("UPDATE admin_users SET role = ? WHERE id = ?", [
      role,
      userId,
    ]);

    // If the user is updating their own role, generate a new token
    if (userId == requesterId) {
      const newToken = jwt.sign(
        { userId: requesterId, role: role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Update the stored token in the database
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
      await db.query(
        "UPDATE user_tokens SET token = ?, expires_at = ? WHERE user_id = ? AND is_revoked = FALSE",
        [newToken, expiresAt, requesterId]
      );

      return res.status(200).json({
        status: "success",
        message: "Your role has been updated successfully",
        token: newToken,
      });
    }

    res.status(200).json({
      status: "success",
      message: `User role for user ID ${userId} updated successfully`,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to update user role", error });
  }
};

// Function to update the user's password
export const updatePassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  try {
    // Fetch the user's current password
    const [rows] = await db.query(
      "SELECT password FROM admin_users WHERE id = ?",
      [userId]
    );

    // Check if the user was found
    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "error", message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await db.query("UPDATE admin_users SET password = ? WHERE id = ?", [
      hashedNewPassword,
      userId,
    ]);

    // Respond with success
    res
      .status(200)
      .json({ status: "success", message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to update password", error });
  }
};

// Function to deactivate (soft delete) the user's account
export const deleteAccount = async (req, res) => {
  const userId = req.params.id; // ID of the user to deactivate
  console.log(userId);
  const { password } = req.body; // Password for verification (if self-deactivating)
  const requesterId = req.user.userId; // ID of the user making the request
  const requesterRole = req.user.role; // Role of the user making the request
  const token = req.header("Authorization")?.split(" ")[1]; // Get the token from the request

  try {
    if (requesterId === userId) {
      // Self-deactivation
      const [rows] = await db.query(
        "SELECT password FROM admin_users WHERE id = ?",
        [userId]
      );
      console.log(userId);
      console.log(rows);
      // Check if the user was found
      if (!rows || rows.length === 0) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      // Verify the provided password
      const isMatch = await bcrypt.compare(password, rows[0].password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ status: "error", message: "Password is incorrect" });
      }

      // Deactivate the account by setting is_active to 0
      await db.query("UPDATE admin_users SET is_active = 0 WHERE id = ?", [
        userId,
      ]);

      // Revoke the token to log the user out
      await revokeToken(token);

      // Respond with success
      return res.status(200).json({
        status: "success",
        message: "Account deactivated successfully",
      });
    } else if (requesterRole === "admin") {
      // Admin is deactivating another user's account
      const [rows] = await db.query("SELECT * FROM admin_users WHERE id = ?", [
        userId,
      ]);
      console.log(rows);
      // Check if the user was found
      if (!rows || rows.length === 0) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      // Deactivate the account by setting is_active to 0
      await db.query("UPDATE admin_users SET is_active = 0 WHERE id = ?", [
        userId,
      ]);

      // Revoke all tokens associated with the user being deactivated
      await revokeUserTokens(userId); // Function to revoke all tokens for the user

      // Respond with success
      return res.status(200).json({
        status: "success",
        message: `User ID ${userId} deactivated successfully`,
      });
    } else {
      // If the requester is not the user and not an admin
      return res.status(403).json({
        status: "error",
        message: "Insufficient permissions to deactivate this account",
      });
    }
  } catch (error) {
    console.error("Error deactivating account:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to deactivate account",
      error,
    });
  }
};

export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  // Revoke the token in the database
  await revokeToken(token);

  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
};

// Function to update the user's profile image
// Function to update the user's profile image
export const updateImage = async (req, res) => {
  const userId = req.user.userId; // Get the userId from the token
  if (!req.file) {
    return res
      .status(400)
      .json({ status: "error", message: "No image uploaded" });
  }

  const imageUrl = `/uploads/profiles/${req.file.filename}`; // Construct image URL from the file name

  try {
    // Update the user's profile image URL in the database
    await db.query("UPDATE admin_users SET image_url = ? WHERE id = ?", [
      imageUrl,
      userId,
    ]);

    // Respond with a success message
    res.status(200).json({
      status: "success",
      message: "Profile image updated successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update profile image",
      error,
    });
  }
};
