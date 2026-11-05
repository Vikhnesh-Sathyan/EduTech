
const express = require("express");

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

// Create Theory Challenge
const {
    createTheoryChallenge
} = require("../../../../controllers/admin/challenges/theory/createTheoryChallengeController");

// Get all Theory Challenges
const {
    getTheoryChallenges
} = require("../../../../controllers/admin/challenges/theory/getTheoryChallengesController");

// Get Theory Challenge details
const {
    getTheoryChallengeById
} = require("../../../../controllers/admin/challenges/theory/getTheoryChallengeByIdController");

// Update Theory Challenge
const {
    updateTheoryChallenge
} = require("../../../../controllers/admin/challenges/theory/updateTheoryChallengeController");

// Update Theory Challenge status
const {
    updateTheoryChallengeStatus
} = require("../../../../controllers/admin/challenges/theory/updateTheoryChallengeStatusController");

const {
    deleteTheoryChallenge
} = require("../../../../controllers/admin/challenges/theory/deleteTheoryChallengeController");


const router = express.Router();


// ==========================================
// THEORY CHALLENGE ROUTES
// ==========================================

// Create
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createTheoryChallenge
);

// Get all
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getTheoryChallenges
);

// Get by ID
router.get(
    "/:challengeId",
    authMiddleware,
    roleMiddleware("admin"),
    getTheoryChallengeById
);

// Update
router.put(
    "/:challengeId",
    authMiddleware,
    roleMiddleware("admin"),
    updateTheoryChallenge
);

// Publish, archive or change status
router.patch(
    "/:challengeId/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateTheoryChallengeStatus
);

// Delete Theory Challenge
router.delete(
    "/:challengeId",
    authMiddleware,
    roleMiddleware("admin"),
    deleteTheoryChallenge
);


module.exports = router;
