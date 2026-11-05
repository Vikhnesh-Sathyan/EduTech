
const express = require("express");

const {
    getCodingChallengeTypes,
    createCodingChallengeType
} = require("../../../../controllers/admin/challenges/coding/codingChallengeTypeController");

// Update challenge type
const {
    updateCodingChallengeType
} = require("../../../../controllers/admin/challenges/coding/updateCodingChallengeTypeController");

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

const router = express.Router();

// Get all coding challenge types
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getCodingChallengeTypes
);

// Create a coding challenge type
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createCodingChallengeType
);

// Update coding challenge type
router.put(
    "/:typeId",
    authMiddleware,
    roleMiddleware("admin"),
    updateCodingChallengeType
);

module.exports = router;
