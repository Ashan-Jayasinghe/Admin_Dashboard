import express from "express";
import cors from "cors";
import db from "./config/db.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Listen on PORT
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
