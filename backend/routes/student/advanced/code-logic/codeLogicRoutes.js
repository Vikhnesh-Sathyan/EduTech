
const express = require("express");
const router = express.Router();

const {
    getPublishedProblems
} = require(
    "../../../../controllers/student/advanced/code-logic/getCodeLogicProblemsController"
);

const {
    getProblemDetails
} = require(
    "../../../../controllers/student/advanced/code-logic/getCodeLogicProblemDetailsController"
);

const {
    submitCodeLogicAttempt
} = require(
    "../../../../controllers/student/advanced/code-logic/submitCodeLogicAttemptController"
);

const {
    getCodeLogicAttemptHistory
} = require(
    "../../../../controllers/student/advanced/code-logic/getCodeLogicAttemptHistoryController"
);

const {
    startCodeLogicAttempt
} = require(
    "../../../../controllers/student/advanced/code-logic/startCodeLogicAttemptController"
);

const {
    getCodeLogicHint
} = require(
    "../../../../controllers/student/advanced/code-logic/getCodeLogicHintController"
);

const authMiddleware = require(
    "../../../../middleware/authMiddleware"
);

const roleMiddleware = require(
    "../../../../middleware/roleMiddleware"
);

// =====================================================
// STUDENT LOGIC TO CODE ROUTES
// =====================================================

// Get all published problems
router.get(
    "/problems",
    authMiddleware,
    roleMiddleware("student"),
    getPublishedProblems
);

// Get one published problem by ID
router.get(
    "/problems/:problemId",
    authMiddleware,
    roleMiddleware("student"),
    getProblemDetails
);

// Submit a Logic to Code attempt
router.post(
    "/problems/:problemId/submit",
    authMiddleware,
    roleMiddleware("student"),
    submitCodeLogicAttempt
);

// Get the logged-in student's attempt history
router.get(
    "/problems/:problemId/attempts",
    authMiddleware,
    roleMiddleware("student"),
    getCodeLogicAttemptHistory
);

// Start or resume a Logic to Code attempt
router.post(
    "/problems/:problemId/start",
    authMiddleware,
    roleMiddleware("student"),
    startCodeLogicAttempt
);

// Get a hint for the active attempt
router.get(
    "/problems/:problemId/hint",
    authMiddleware,
    roleMiddleware("student"),
    getCodeLogicHint
);

module.exports = router;
