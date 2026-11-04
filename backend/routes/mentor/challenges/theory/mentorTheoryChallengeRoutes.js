const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

// ==========================================
// IMPORT CONTROLLERS
// ==========================================

const {
    getMentorTheoryChallengeTypes
} = require("../../../../controllers/mentor/challenges/theory/getMentorTheoryChallengeTypesController");

const {
    createMentorTheoryChallenge
} = require("../../../../controllers/mentor/challenges/theory/createMentorTheoryChallengeController");

const {
    getMentorTheoryChallenges
} = require("../../../../controllers/mentor/challenges/theory/getMentorTheoryChallengesController");

const {
    getMentorTheoryChallengeById
} = require("../../../../controllers/mentor/challenges/theory/getMentorTheoryChallengeByIdController");

const {
    updateMentorTheoryChallenge
} = require("../../../../controllers/mentor/challenges/theory/updateMentorTheoryChallengeController");

const {
    updateMentorTheoryChallengeStatus
} = require("../../../../controllers/mentor/challenges/theory/updateMentorTheoryChallengeStatusController");

const {
    getMentorTheoryChallengeSubmissions
} = require("../../../../controllers/mentor/challenges/theory/getMentorTheoryChallengeSubmissionsController");

const {
    reviewMentorTheoryChallengeSubmission
} = require("../../../../controllers/mentor/challenges/theory/reviewMentorTheoryChallengeSubmissionController");

// ==========================================
// MENTOR THEORY CHALLENGE ROUTES
// ==========================================

// Get active Theory Challenge types
router.get(
    "/types",
    authMiddleware,
    roleMiddleware("mentor"),
    getMentorTheoryChallengeTypes
);

// Get all mentor Theory Challenges
router.get(
    "/",
    authMiddleware,
    roleMiddleware("mentor"),
    getMentorTheoryChallenges
);

// Create Theory Challenge
router.post(
    "/",
    authMiddleware,
    roleMiddleware("mentor"),
    createMentorTheoryChallenge
);

// Get all student submissions
router.get(
    "/submissions",
    authMiddleware,
    roleMiddleware("mentor"),
    getMentorTheoryChallengeSubmissions
);

// Review student Theory Challenge submission
router.patch(
    "/submissions/:attemptId/review",
    authMiddleware,
    roleMiddleware("mentor"),
    reviewMentorTheoryChallengeSubmission
);

// Get Theory Challenge by ID
router.get(
    "/:challengeId",
    authMiddleware,
    roleMiddleware("mentor"),
    getMentorTheoryChallengeById
);

// Update draft Theory Challenge
router.put(
    "/:challengeId",
    authMiddleware,
    roleMiddleware("mentor"),
    updateMentorTheoryChallenge
);

// Update Theory Challenge status
router.patch(
    "/:challengeId/status",
    authMiddleware,
    roleMiddleware("mentor"),
    updateMentorTheoryChallengeStatus
);

module.exports = router;