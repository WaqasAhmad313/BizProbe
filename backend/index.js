require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import database connection (Handles connection inside `db.js`)
require("./src/db");

// Import routes
const userRoutes = require("./src/routes/userRoutes"); // ✅ Corrected Path

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Default Route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running...");
});

// Frontend-Backend Connection Test Route
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Frontend Connected to Backend!" });
});

// Use API Routes
app.use("/api/users", userRoutes); // ✅ Uses Correct Variable

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
