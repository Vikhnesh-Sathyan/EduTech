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

// Import Node.js built-in HTTP module.
// Used to create an HTTP server that supports both Express and Socket.IO.
const http = require("http");

// Import the Socket.IO Server class.
// Used to enable real-time communication between students and mentors.
const { Server } = require("socket.io");

// Import the chat socket registration function.
// This file handles chat authentication, conversation rooms,
// sending messages, and receiving real-time messages.
const registerChatSocket = require("./sockets/chatSocket");

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

const adminLearningAdvancedRoutes = require(
    "./routes/admin/advancedLearningRoutes"
);

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

//cheat sheet
const adminTechnologyRoutes =
    require("./routes/admin/cheatsheet/technologyRoutes");

const adminCategoryRoutes =
    require("./routes/admin/cheatsheet/categoryRoutes");

const adminTopicCheatSheetRoutes =
    require("./routes/admin/cheatsheet/topicRoutes");

const adminSubtopicCheatSheetRoutes =
    require("./routes/admin/cheatsheet/subtopicRoutes");

const adminCheatsheetImportRoutes =
    require("./routes/admin/cheatsheet/importRoutes");

// Admin Skill Swap routes
const adminSwapSkillsRoutes =
    require("./routes/admin/skillswap/swapskillsroutes");

const adminSwapSkillSuggestionRoutes =
    require("./routes/admin/skillswap/swapskillsuggestionroutes");


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
    
const studentAdvancedRoutes = require(
    "./routes/student/advanced/studentAdvancedRoutes"
);

const theoryQuizRoutes = require("./routes/student/advanced/theoryQuizRoutes");

//ADVANCED STUDENT COMPARISON
const studentConceptComparisonRoutes = require(
    "./routes/student/advanced/concept-comparison/conceptComparisonRoutes"
);

const studentCheatsheetRoutes = require("./routes/student/cheatsheet/student-cheatsheet-routes");

// =====================================================
// STUDENT MENTOR CHAT ROUTES
// =====================================================

const chatRoutes = require("./routes/chat/chatRoutes");
    
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

// students recommendations
const recommendationRoutes = require("./routes/student/recommendation/recommendationRoutes");

const resourceRoutes = require("./routes/student/recommendation/resourceRoutes");

const doubtRoutes = require("./routes/student/recommendation/doubtRoutes");

const interviewPrepRoutes = require("./routes/student/recommendation/interviewPrepRoutes");

const codingRoutes = require("./routes/student/recommendation/codingRoutes");

// =====================================================
// STUDENT SKILL SWAPS
// =====================================================
const studentSwapSkillsRoutes =
    require("./routes/student/skillswap/swapskillsroutes");

const studentSwapSkillProfileRoutes =
    require("./routes/student/skillswap/swapskillstudentroutes");

const studentSwapSkillDiscoveryRoutes =
    require("./routes/student/skillswap/swapskilldiscoveryroutes");

const studentSwapRequestRoutes =
    require("./routes/student/skillswap/swapskillrequestroutes");

const studentSwapSkillSessionRoutes =
    require("./routes/student/skillswap/swapskillsessionroutes");

const studentSwapSkillSuggestionRoutes =
    require("./routes/student/skillswap/swapskillsuggestionroutes");

//STUDENT SHUFFLE CODE
const studentCodeShuffleRoutes = require(
    "./routes/student/advanced/code-shuffle/codeShuffleStudentRoutes"
);

//STUDENT CODE-LOGIC




// =====================================================
// MENTOR ROUTES
// =====================================================

// Mentor profile and dashboard routes
const mentorRoutes = require("./routes/mentor/mentorRoutes");

const mentorTechnologyRoutes = require("./routes/mentor/cheatsheet/technologyRoutes");

const mentorCategoryRoutes = require("./routes/mentor/cheatsheet/categoryRoutes");

const mentorTopicRoutes = require("./routes/mentor/cheatsheet/topicRoutes");

const mentorSubtopicRoutes = require("./routes/mentor/cheatsheet/subtopicRoutes");

//MENTOR QUIZ
const mentorTheoryQuizRoutes = require(
    "./routes/mentor/advanced/theoryQuizRoutes");

//Mentor Concept COMPARISON 
const mentorConceptComparisonRoutes = require(
    "./routes/mentor/advanced/concept-comparison/conceptComparisonRoutes");

//MENTOR CODE SHUFFLE
const mentorCodeShuffleRoutes = require(
    "./routes/mentor/advanced/code-shuffle/codeShuffleRoutes"
);

//MENOT CODE-LOGIC
const mentorCodeLogicRoutes = require(
    "./routes/mentor/advanced/code-logic/codeLogicRoutes"
);



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

app.use(
    "/api/mentor/cheatsheet/technologies",
    mentorTechnologyRoutes
);

app.use(
    "/api/mentor/cheatsheet/categories",
    mentorCategoryRoutes
);

app.use(
    "/api/mentor/cheatsheet/topics",
    mentorTopicRoutes
);

app.use(
    "/api/mentor/cheatsheet/subtopics",
    mentorSubtopicRoutes
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
// MENTOR QUIZ
app.use(
    "/api/mentor/advanced/theory-quizzes",
    mentorTheoryQuizRoutes
);

// Mentor Concept Comparison routes
app.use(
    "/api/mentor/advanced/concept-comparisons",
    mentorConceptComparisonRoutes
);

//MENTOR CODE SHUFFLE
app.use(
    "/api/mentor/advanced/code-shuffle",
    mentorCodeShuffleRoutes
);

//MENTOR CODE-LOGIC
app.use(
    "/api/mentor/advanced/code-logic",
     mentorCodeLogicRoutes);
    
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

app.use(
    "/api/admin/advanced",
    adminLearningAdvancedRoutes
);;

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

//cheat sheet
app.use(
    "/api/admin/cheatsheet/technologies",
    adminTechnologyRoutes
);

app.use(
    "/api/admin/cheatsheet/categories",
    adminCategoryRoutes
);

app.use(
    "/api/admin/cheatsheet/topics",
    adminTopicCheatSheetRoutes
);


app.use(
    "/api/admin/cheatsheet/subtopics",
    adminSubtopicCheatSheetRoutes
);

app.use(
    "/api/admin/cheatsheet/import",
    adminCheatsheetImportRoutes
);

// =====================================================
// ADMIN PROJECT UNDERSTANDING ROUTES
// =====================================================

// Project Understanding management
app.use(
    "/api/admin/projects",
    adminProjectRoutes
);

// Admin Skill Swap
app.use(
    "/api/admin/skillswap/skills",
    adminSwapSkillsRoutes
);

app.use(
    "/api/admin/skillswap/suggestions",
    adminSwapSkillSuggestionRoutes
);


// =====================================================
// STUDENT EDUCATION ROUTES
// =====================================================

// Student education lookup
app.use(
    "/api/education",
    educationRoutes
);

app.use(
    "/api/student/cheatsheet", 
    studentCheatsheetRoutes
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

// Student Basic Challenge
app.use(
    "/api/student/basic-challenge",
    studentBasicChallengeRoutes
);
//STUDENT ADVANCED 
app.use(
    "/api/student/advanced",
    studentAdvancedRoutes
);

app.use("/api/student/advanced", theoryQuizRoutes);

app.use(
    "/api/student/advanced/concept-comparisons",
    studentConceptComparisonRoutes
);

// =====================================================
// STUDENT MENTOR CHAT ROUTES
// =====================================================

app.use("/api/chat", chatRoutes);

// =====================================================
// STUDENT RECOMMENDATIONS
// =====================================================

app.use("/api/recommendation", recommendationRoutes);

app.use("/api/recommendation/resources", resourceRoutes);

app.use("/api/recommendation/doubts", doubtRoutes);

app.use("/api/recommendation/interview-prep", interviewPrepRoutes);

app.use("/api/recommendation/coding", codingRoutes);

// =====================================================
// STUDENT SKILL SWAP
// =====================================================
app.use(
    "/api/student/skillswap/skills",
    studentSwapSkillsRoutes
);

app.use(
    "/api/student/skillswap/my-skills",
    studentSwapSkillProfileRoutes
);

app.use(
    "/api/student/skillswap/discover",
    studentSwapSkillDiscoveryRoutes
);

app.use(
    "/api/student/skillswap/requests",
    studentSwapRequestRoutes
);

app.use(
    "/api/student/skillswap/sessions",
    studentSwapSkillSessionRoutes
);

app.use(
    "/api/student/skillswap/suggestions",
    studentSwapSkillSuggestionRoutes
);

app.use(
    "/api/student/advanced/code-shuffle",
    studentCodeShuffleRoutes
);

//STUDENT CODE_LOGIC

// =====================================================
// START SERVER WITH SOCKET.IO
// =====================================================

const server = http.createServer(app);

const io = new Server(server, {
cors: {
origin: "*",
methods: ["GET", "POST"]
}
});

app.set("io", io);

// Register chat authentication and events.
registerChatSocket(io);

server.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
console.log("Socket.IO is ready");
});