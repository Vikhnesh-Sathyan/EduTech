
const express = require("express");

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

// Get available challenges
const {
    getStudentCodingChallenges
} = require("../../../../controllers/student/challenges/coding/getStudentCodingChallengesController");

// Get challenge details
const {
    getStudentCodingChallengeById
} = require("../../../../controllers/student/challenges/coding/getStudentCodingChallengeByIdController");

// Submit attempt
const {
    submitCodingChallengeAttempt
} = require("../../../../controllers/student/challenges/coding/submitCodingChallengeAttemptController");

// Get attempt history
const {
    getStudentCodingChallengeHistory
} = require("../../../../controllers/student/challenges/coding/getStudentCodingChallengeHistoryController");

// Get individual attempt result
const {
    getStudentCodingChallengeAttemptResult
} = require("../../../../controllers/student/challenges/coding/getStudentCodingChallengeAttemptResultController");

const {
    executeStudentCodingChallengeAttempt
} = require("../../../../controllers/student/challenges/coding/executeStudentCodingChallengeAttemptController");

const router = express.Router();


// ==========================================
// STUDENT CODING CHALLENGE ROUTES
// ==========================================

// Get available challenges
router.get(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    getStudentCodingChallenges
);

// Get complete attempt history
router.get(
    "/history",
    authMiddleware,
    roleMiddleware("student"),
    getStudentCodingChallengeHistory
);

// Get individual attempt result
router.get(
    "/attempts/:attemptId",
    authMiddleware,
    roleMiddleware("student"),
    getStudentCodingChallengeAttemptResult
);

// Get challenge details
router.get(
    "/:challengeId",
    authMiddleware,
    roleMiddleware("student"),
    getStudentCodingChallengeById
);

// Submit coding attempt
router.post(
    "/:challengeId/submit",
    authMiddleware,
    roleMiddleware("student"),
    submitCodingChallengeAttempt
);

router.post(
    "/attempts/:attemptId/execute",
    authMiddleware,
    roleMiddleware("student"),
    executeStudentCodingChallengeAttempt
);

module.exports = router;
