
const express = require("express");

const {
    uploadStudyDocument,
    restoreStudySession,
    askStudyQuestion,
    getStudyChatHistory
} = require("../controllers/studyCompanionController");

const {
    generateStudySummary,
    generateStudyPageSummary,
    getStudySummaries
} = require("../controllers/studyCompanionSummaryController");

const {
    generateStudyImportantPoints,
    getStudyImportantPoints
} = require("../controllers/studyCompanionImportantPointsController");


const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const uploadStudyDocumentMiddleware = require("../middleware/uploadStudyDocument");

const router = express.Router();

// Upload PDF document
router.post(
    "/upload",
    authMiddleware,
    roleMiddleware("student"),
    uploadStudyDocumentMiddleware.single("file"),
    uploadStudyDocument
);

// Restore existing study session
router.post(
    "/:sessionUuid/restore",
    authMiddleware,
    roleMiddleware("student"),
    restoreStudySession
);

// Ask a question about the uploaded document
router.post(
    "/:sessionUuid/ask",
    authMiddleware,
    roleMiddleware("student"),
    askStudyQuestion
);

// Get saved study chat history
router.get(
    "/:sessionUuid/messages",
    authMiddleware,
    roleMiddleware("student"),
    getStudyChatHistory
);

// ==========================================
// STUDY SUMMARY ROUTES
// ==========================================

// Generate full document summary
router.post(
    "/:sessionUuid/summary",
    authMiddleware,
    roleMiddleware("student"),
    generateStudySummary
);

// Generate selected page summary
router.post(
    "/:sessionUuid/summary/pages",
    authMiddleware,
    roleMiddleware("student"),
    generateStudyPageSummary
);

// Get saved summaries
router.get(
    "/:sessionUuid/summaries",
    authMiddleware,
    roleMiddleware("student"),
    getStudySummaries
);


// ==========================================
// IMPORTANT STUDY POINTS ROUTES
// ==========================================

// Generate and save important points
router.post(
    "/:sessionUuid/important-points",
    authMiddleware,
    roleMiddleware("student"),
    generateStudyImportantPoints
);

// Get saved important points
router.get(
    "/:sessionUuid/important-points",
    authMiddleware,
    roleMiddleware("student"),
    getStudyImportantPoints
);


module.exports = router;
