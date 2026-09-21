// Load environment variables from .env
require("dotenv").config();

// Import required packages
const express = require("express");
const cors = require("cors");

// Import database connection
const db = require("./config/db");

// Import application routes
const authRoutes = require("./routes/authRoutes");

// Create Express application
const app = express();

// ==================== MIDDLEWARE ====================

// Allow requests from the Angular frontend
app.use(cors());

// Parse incoming JSON request data
app.use(express.json());

// ==================== PORT ====================

const PORT = process.env.PORT || 5000;

// ==================== ROUTES ====================

// Basic server health check
app.get("/", (req, res) => {
    res.send("EduTech Backend is running");
});

// Authentication routes
app.use("/api/auth", authRoutes);

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});