
const express = require("express");

const {
    getTheoryChallengeTypes,
    createTheoryChallengeType
} = require("../../../../controllers/admin/challenges/theory/theoryChallengeTypeController");

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

const router = express.Router();

// Get all theory challenge types
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getTheoryChallengeTypes
);

// Create a theory challenge type
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createTheoryChallengeType
);

module.exports = router;
