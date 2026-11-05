const express = require("express");

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

// Create challenge
const {
    createCodingChallenge
} = require("../../../../controllers/admin/challenges/coding/createCodingChallengeController");

// Get challenge list
const {
    getCodingChallenges
} = require("../../../../controllers/admin/challenges/coding/getCodingChallengesController");

// Get challenge details
const {
    getCodingChallengeById
} = require("../../../../controllers/admin/challenges/coding/getCodingChallengeByIdController");

// Update challenge
const {
    updateCodingChallenge
} = require("../../../../controllers/admin/challenges/coding/updateCodingChallengeController");

// Update challenge status
const {
    updateCodingChallengeStatus
} = require("../../../../controllers/admin/challenges/coding/updateCodingChallengeStatusController");


const router = express.Router();


// ==========================================
// CODING CHALLENGE ROUTES
// ==========================================

// Create coding challenge
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createCodingChallenge
);

// Get all coding challenges
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getCodingChallenges
);

// Get coding challenge details
router.get(
    "/:challengeId",
    authMiddleware,
    roleMiddleware("admin"),
    getCodingChallengeById
);

// Update coding challenge
router.put(
    "/:challengeId",
    authMiddleware,
    roleMiddleware("admin"),
    updateCodingChallenge
);

// Publish, archive or change status
router.patch(
    "/:challengeId/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateCodingChallengeStatus
);


module.exports = router;
