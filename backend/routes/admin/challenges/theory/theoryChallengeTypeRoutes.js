
const express = require("express");

const {
    getTheoryChallengeTypes,
    createTheoryChallengeType
} = require("../../../../controllers/admin/challenges/theory/theoryChallengeTypeController");

const {
    updateTheoryChallengeType
} = require("../../../../controllers/admin/challenges/theory/updateTheoryChallengeTypeController");

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// GET ALL THEORY CHALLENGE TYPES
// ==========================================

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getTheoryChallengeTypes
);

// ==========================================
// CREATE THEORY CHALLENGE TYPE
// ==========================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createTheoryChallengeType
);

// ==========================================
// UPDATE THEORY CHALLENGE TYPE
// ==========================================

router.put(
    "/:typeId",
    authMiddleware,
    roleMiddleware("admin"),
    updateTheoryChallengeType
);

module.exports = router;
