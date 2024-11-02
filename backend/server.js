import express from "express";
import cors from "cors";
import db from "./config/db.js";
import dotenv from "dotenv";
// import userRoutes from "./routes/userRoutes.js";
// import advertisementRoutes from "./routes/advertisementRoutes.js";
// import authRoutes from "./routes/authRoutes.js";
// import errorHandler from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 5001;
console.log(PORT);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// User routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/advertisements", advertisementRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware should be the last middleware
// app.use(errorHandler);

// Listen on PORT
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
