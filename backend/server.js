// Load environment variables from .env
require("dotenv").config();

// Import required packages
const express = require("express");
const cors = require("cors");

// Import database connection
const db = require("./config/db");

// Import application routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

// ==================== EDUCATION ROUTES ====================

const educationProgramRoutes =
    require("./routes/educationProgramRoutes");

// ==================== ADMIN DEPARTMENT ROUTES ====================
const departmentRoutes =
    require("./routes/departmentRoutes");

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

// ==================== AUTHENTICATION ROUTES ====================

// Handles registration, login and authenticated user information
app.use("/api/auth", authRoutes);

// ==================== PROFILE ROUTES ====================

// Handles the authenticated student's profile
app.use("/api/profile", profileRoutes);


// ==================== ADMIN EDUCATION ROUTES ====================

// Handles admin education program configuration
app.use(
    "/api/admin/education-programs",
    educationProgramRoutes
);

// ==================== ADMIN DEPARTMENT ROUTES ====================

// Handles admin department configuration
app.use(
    "/api/admin/departments",
    departmentRoutes
);



// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});