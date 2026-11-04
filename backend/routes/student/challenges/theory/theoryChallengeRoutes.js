
const express = require("express");

const router = express.Router();

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

// ==========================================
// IMPORT STUDENT THEORY CONTROLLERS
// ==========================================

const {
    getStudentTheoryChallenges
} = require("../../../../controllers/student/challenges/theory/getStudentTheoryChallengesController");

const {
    getStudentTheoryChallengeById
} = require("../../../../controllers/student/challenges/theory/getStudentTheoryChallengeByIdController");

const {
    submitTheoryChallengeAttempt
} = require("../../../../controllers/student/challenges/theory/submitTheoryChallengeAttemptController");

const {
    getStudentTheoryChallengeHistory
} = require("../../../../controllers/student/challenges/theory/getStudentTheoryChallengeHistoryController");

const {
    getStudentTheoryChallengeAttemptResult
} = require("../../../../controllers/student/challenges/theory/getStudentTheoryChallengeAttemptResultController");


// ==========================================
// STUDENT THEORY CHALLENGE ROUTES
// ==========================================

// Get available Theory Challenges
router.get(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    getStudentTheoryChallenges
);

// Get student's complete attempt history
router.get(
    "/history",
    authMiddleware,
    roleMiddleware("student"),
    getStudentTheoryChallengeHistory
);

// Get one attempt result
router.get(
    "/attempts/:attemptId",
    authMiddleware,
    roleMiddleware("student"),
    getStudentTheoryChallengeAttemptResult
);

// Get individual challenge details
router.get(
    "/:challengeId",
    authMiddleware,
    roleMiddleware("student"),
    getStudentTheoryChallengeById
);

// Submit a Theory Challenge
router.post(
    "/:challengeId/submit",
    authMiddleware,
    roleMiddleware("student"),
    submitTheoryChallengeAttempt
);

module.exports = router;
