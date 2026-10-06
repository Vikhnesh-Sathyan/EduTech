// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

require("dotenv").config();


// =====================================================
// IMPORT REQUIRED PACKAGES
// =====================================================

const express = require("express");
const cors = require("cors");
const path = require("path");


// =====================================================
// IMPORT DATABASE CONNECTION
// =====================================================

const db = require("./config/db");


// =====================================================
// APPLICATION ROUTES
// =====================================================

// Authentication routes
const authRoutes =
    require("./routes/authRoutes");

// Student profile routes
const profileRoutes =
    require("./routes/profileRoutes");


// =====================================================
// ADMIN ROUTES
// =====================================================

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

// Admin learning section routes
const adminLearningSectionRoutes =
    require("./routes/adminLearningSectionRoutes");

// Admin section learning content routes
const adminSectionLearningRoutes =
    require("./routes/adminSectionLearningRoutes");

// Admin topic routes
const adminTopicRoutes =
    require("./routes/adminTopicRoutes");

// Admin subtopic routes
const adminSubtopicRoutes =
    require("./routes/adminSubtopicRoutes");

// Admin Project Understanding routes
const adminProjectRoutes =
    require("./routes/adminProjectRoutes");


// =====================================================
// STUDENT ROUTES
// =====================================================

// Student education lookup routes
const educationRoutes =
    require("./routes/educationRoutes");

// Student subject routes
const studentSubjectRoutes =
    require("./routes/studentSubjectRoutes");

// Student section learning routes
const studentSectionLearningRoutes =
    require("./routes/studentSectionLearningRoutes");

// Student Project Understanding routes
const studentProjectRoutes =
    require("./routes/studentProjectRoutes");


// =====================================================
// STUDY AND DIAGNOSTIC ROUTES
// =====================================================

// Student study routes
const studyRoutes =
    require("./routes/studyRoutes");

// Student diagnostic routes
const diagnosticRoutes =
    require("./routes/diagnosticRoutes");


// =====================================================
// MENTOR-STUDENT RELATIONSHIP ROUTES
// =====================================================

// Handles mentorship requests and relationships
const mentorStudentRoutes =
    require("./routes/mentorStudentRoutes");

const studentMentorRoutes =
    require("./routes/studentMentorRoutes");

// =====================================================
// MENTOR ROUTES
// =====================================================

// Mentor profile and dashboard routes
const mentorRoutes =
    require("./routes/mentorRoutes");


// =====================================================
// CREATE EXPRESS APPLICATION
// =====================================================

const app = express();


// =====================================================
// GLOBAL MIDDLEWARE
// =====================================================

// Allow requests from the Angular frontend
app.use(cors());

// Parse incoming JSON request data
app.use(express.json());


// =====================================================
// STATIC FILES
// =====================================================

// Serve uploaded learning and project images
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


// =====================================================
// PORT CONFIGURATION
// =====================================================

const PORT =
    process.env.PORT || 5000;


// =====================================================
// BASIC SERVER ROUTE
// =====================================================

// Basic server health check
app.get("/", (req, res) => {

    res.send(
        "EduTech Backend is running"
    );

});


// =====================================================
// AUTHENTICATION ROUTES
// =====================================================

// Handles registration and login
app.use(
    "/api/auth",
    authRoutes
);


// =====================================================
// STUDENT PROFILE ROUTES
// =====================================================

// Handles authenticated student profile
app.use(
    "/api/profile",
    profileRoutes
);


// =====================================================
// MENTOR ROUTES
// =====================================================

// Handles mentor profile and dashboard
app.use(
    "/api/mentor",
    mentorRoutes
);


// =====================================================
// MENTOR-STUDENT RELATIONSHIP ROUTES
// =====================================================

app.use(
    "/api/student/mentors",
    studentMentorRoutes
);

// Handles mentorship requests,
// acceptance and rejection
app.use(
    "/api/mentor-student",
    mentorStudentRoutes
);


// =====================================================
// ADMIN ROUTES
// =====================================================

// Education programs
app.use(
    "/api/admin/education-programs",
    educationProgramRoutes
);

// Departments
app.use(
    "/api/admin/departments",
    departmentRoutes
);

// Education years
app.use(
    "/api/admin/education-years",
    educationYearRoutes
);

// Subjects
app.use(
    "/api/admin/subjects",
    subjectRoutes
);

// Admin dashboard overview
app.use(
    "/api/admin/overview",
    adminOverviewRoutes
);

// Mentor verification
app.use(
    "/api/admin/mentors",
    adminMentorRoutes
);

// Diagnostic question management
app.use(
    "/api/admin/diagnostic-questions",
    adminDiagnosticRoutes
);

// Learning section management
app.use(
    "/api/admin/learning-sections",
    adminLearningSectionRoutes
);

// Learning content inside a section
app.use(
    "/api/admin/section-learning",
    adminSectionLearningRoutes
);

// Topic management
app.use(
    "/api/admin/topics",
    adminTopicRoutes
);

// Subtopic management
app.use(
    "/api/admin/subtopics",
    adminSubtopicRoutes
);


// =====================================================
// ADMIN PROJECT UNDERSTANDING ROUTES
// =====================================================

// Project Understanding management
app.use(
    "/api/admin/projects",
    adminProjectRoutes
);


// =====================================================
// STUDENT EDUCATION ROUTES
// =====================================================

// Student education lookup
app.use(
    "/api/education",
    educationRoutes
);


// =====================================================
// STUDENT STUDY ROUTES
// =====================================================

// Student subjects
app.use(
    "/api/student/subjects",
    studentSubjectRoutes
);

// Student section learning
app.use(
    "/api/student/section-learning",
    studentSectionLearningRoutes
);

// Student Study
app.use(
    "/api/study",
    studyRoutes
);

// Student diagnostic
app.use(
    "/api/diagnostic",
    diagnosticRoutes
);


// =====================================================
// STUDENT PROJECT UNDERSTANDING ROUTES
// =====================================================

// Student Project Understanding
app.use(
    "/api/student/projects",
    studentProjectRoutes
);


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});
