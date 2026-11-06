const express = require("express");

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

// Get active coding challenge types
const {
    getMentorCodingChallengeTypes
} = require("../../../../controllers/mentor/challenges/coding/getMentorCodingChallengeTypesController");

// Get mentor's coding challenges
const {
    getMentorCodingChallenges
} = require("../../../../controllers/mentor/challenges/coding/getMentorCodingChallengesController");

// Get individual challenge details
const {
    getMentorCodingChallengeById
} = require("../../../../controllers/mentor/challenges/coding/getMentorCodingChallengeByIdController");

// Create coding challenge
const {
    createMentorCodingChallenge
} = require("../../../../controllers/mentor/challenges/coding/createMentorCodingChallengeController");

// Update coding challenge
const {
    updateMentorCodingChallenge
} = require("../../../../controllers/mentor/challenges/coding/updateMentorCodingChallengeController");

// Update challenge status
const {
    updateMentorCodingChallengeStatus
} = require("../../../../controllers/mentor/challenges/coding/updateMentorCodingChallengeStatusController");

// Delete coding challenge
const {
    deleteMentorCodingChallenge
} = require("../../../../controllers/mentor/challenges/coding/deleteMentorCodingChallengeController");

const {
    saveCodingChallengeTestCases
} = require("../../../../controllers/mentor/challenges/coding/saveCodingChallengeTestCasesController");

const router = express.Router();

// ==========================================
// MENTOR CODING CHALLENGE ROUTES
// ==========================================

// Get active challenge types
router.get(
    "/types",
    authMiddleware,
    roleMiddleware("mentor"),
    getMentorCodingChallengeTypes
);

// Get mentor's challenges
router.get(
    "/",
    authMiddleware,
    roleMiddleware("mentor"),
    getMentorCodingChallenges
);

// Create challenge
router.post(
    "/",
    authMiddleware,
    roleMiddleware("mentor"),
    createMentorCodingChallenge
);

// Get individual challenge details
router.get(
    "/:challengeId",
    authMiddleware,
    roleMiddleware("mentor"),
    getMentorCodingChallengeById
);

// Update draft challenge
router.put(
    "/:challengeId",
    authMiddleware,
    roleMiddleware("mentor"),
    updateMentorCodingChallenge
);

// Delete coding challenge
router.delete(
    "/:challengeId",
    authMiddleware,
    roleMiddleware("mentor"),
    deleteMentorCodingChallenge
);

// Publish, archive or return to draft
router.patch(
    "/:challengeId/status",
    authMiddleware,
    roleMiddleware("mentor"),
    updateMentorCodingChallengeStatus
);

router.post(
    "/:challengeId/test-cases",
    authMiddleware,
    roleMiddleware("mentor"),
    saveCodingChallengeTestCases
);


module.exports = router;