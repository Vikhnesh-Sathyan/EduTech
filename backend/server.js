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
    require("./routes/admin/educationProgramRoutes");

// Admin department routes
const departmentRoutes =
    require("./routes/admin/departmentRoutes");

// Admin education year routes
const educationYearRoutes =
    require("./routes/admin/educationYearRoutes");

// Admin subject routes
const subjectRoutes =
    require("./routes/admin/subjectRoutes");

// Admin dashboard overview routes
const adminOverviewRoutes =
    require("./routes/admin/adminOverviewRoutes");

// Admin mentor verification routes
const adminMentorRoutes =
    require("./routes/admin/adminMentorRoutes");

// Admin diagnostic question routes
const adminDiagnosticRoutes =
    require("./routes/admin/adminDiagnosticRoutes");

// Admin learning section routes
const adminLearningSectionRoutes =
    require("./routes/admin/adminLearningSectionRoutes");

// Admin section learning content routes
const adminSectionLearningRoutes =
    require("./routes/admin/adminSectionLearningRoutes");

// Admin topic routes
const adminTopicRoutes =
    require("./routes/admin/adminTopicRoutes");

// Admin subtopic routes
const adminSubtopicRoutes =
    require("./routes/admin/adminSubtopicRoutes");

// Admin Project Understanding routes
const adminProjectRoutes =
    require("./routes/admin/adminProjectRoutes");

const adminBasicChallengeRoutes = require("./routes/admin/adminBasicChallengeRoutes");


// =====================================================
// STUDENT ROUTES
// =====================================================

// Student education lookup routes
const educationRoutes =
    require("./routes/student/educationRoutes");

// Student subject routes
const studentSubjectRoutes =
    require("./routes/student/studentSubjectRoutes");

// Student section learning routes
const studentSectionLearningRoutes =
    require("./routes/student/studentSectionLearningRoutes");

// Student Project Understanding routes
const studentProjectRoutes =
    require("./routes/student/studentProjectRoutes");

// Student Basic Challenge routes
const studentBasicChallengeRoutes =
    require("./routes/student/studentBasicChallengeRoutes");
    
const studentAdvancedRoutes = 
    require("./routes/student/studentAdvancedRoutes");
    
// =====================================================
// STUDY AND DIAGNOSTIC ROUTES
// =====================================================

// Student study routes
const studyRoutes =
    require("./routes/student/studyRoutes");

// Student diagnostic routes
const diagnosticRoutes =
    require("./routes/student/diagnosticRoutes");


// =====================================================
// MENTOR-STUDENT RELATIONSHIP ROUTES
// =====================================================

// Handles mentorship requests and relationships
const mentorStudentRoutes =
    require("./routes/mentor/mentorStudentRoutes");

const studentMentorRoutes =
    require("./routes/mentor/studentMentorRoutes");

// =====================================================
// MENTOR ROUTES
// =====================================================

// Mentor profile and dashboard routes
const mentorRoutes =
    require("./routes/mentor/mentorRoutes");


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

app.use(
  "/api/admin/basic-challenge",
  adminBasicChallengeRoutes
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
app.use(
    "/api/student/advanced", 
    studentAdvancedRoutes
);


// =====================================================
// STUDENT PROJECT UNDERSTANDING ROUTES
// =====================================================

// Student Project Understanding
app.use(
    "/api/student/projects",
    studentProjectRoutes
);

// Student Basic Challenge
app.use(
    "/api/student/basic-challenge",
    studentBasicChallengeRoutes
);

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});

