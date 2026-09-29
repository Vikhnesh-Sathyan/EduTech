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

// ==================== ADMIN ROUTES ====================

// Admin education program routes
const educationProgramRoutes =
    require("./routes/educationProgramRoutes");

// Admin department routes
const departmentRoutes =
    require("./routes/departmentRoutes");

// Admin education year routes
const educationYearRoutes =
    require("./routes/educationYearRoutes");

// Admin subject routes
const subjectRoutes =
    require("./routes/subjectRoutes");

// Admin dashboard overview routes
const adminOverviewRoutes =
    require("./routes/adminOverviewRoutes");

// Admin mentor verification routes
const adminMentorRoutes =
    require("./routes/adminMentorRoutes");

// Admin diagnostic question routes
const adminDiagnosticRoutes =
    require("./routes/adminDiagnosticRoutes");


// ==================== STUDENT ROUTES ====================

// Student education lookup routes
const educationRoutes =
    require("./routes/educationRoutes");

// Student subject routes
const studentSubjectRoutes =
    require("./routes/studentSubjectRoutes");


// ==================== STUDY AND DIAGNOSTIC ROUTES ====================

// Student study routes
const studyRoutes =
    require("./routes/studyRoutes");

// Student diagnostic routes
const diagnosticRoutes =
    require("./routes/diagnosticRoutes");

const adminTopicRoutes =
    require("./routes/adminTopicRoutes");


// ==================== MENTOR ROUTES ====================

// Mentor profile routes
const mentorRoutes =
    require("./routes/mentorRoutes");


// Create Express application
const app = express();


// ==================== MIDDLEWARE ====================

// Allow requests from the Angular frontend
app.use(cors());

// Parse incoming JSON request data
app.use(express.json());


// ==================== PORT ====================

const PORT = process.env.PORT || 5000;


// ==================== BASIC ROUTE ====================

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

// Handles the authenticated mentor's profile
app.use("/api/mentor", mentorRoutes);


// =====================================================
// ==================== ADMIN ROUTES ====================
// =====================================================

// Handles admin education program configuration
app.use(
    "/api/admin/education-programs",
    educationProgramRoutes
);

// Handles admin department configuration
app.use(
    "/api/admin/departments",
    departmentRoutes
);

// Handles admin education year configuration
app.use(
    "/api/admin/education-years",
    educationYearRoutes
);

// Handles admin subject configuration
app.use(
    "/api/admin/subjects",
    subjectRoutes
);

// Handles admin dashboard overview statistics
app.use(
    "/api/admin/overview",
    adminOverviewRoutes
);

// Handles admin mentor verification
app.use(
    "/api/admin/mentors",
    adminMentorRoutes
);

// Handles admin diagnostic question management
app.use(
    "/api/admin/diagnostic-questions",
    adminDiagnosticRoutes
);


// =====================================================
// ==================== STUDENT ROUTES =================
// =====================================================

// Handles student education lookup
app.use(
    "/api/education",
    educationRoutes
);

// Handles student subject selection
app.use(
    "/api/student/subjects",
    studentSubjectRoutes
);


// =====================================================
// ============== STUDY AND DIAGNOSTIC ROUTES ==========
// =====================================================

// Handles student study subjects
app.use(
    "/api/study",
    studyRoutes
);

// Handles student diagnostic
app.use(
    "/api/diagnostic",
    diagnosticRoutes
);

app.use(
    "/api/admin/topics",
    adminTopicRoutes
);


// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});