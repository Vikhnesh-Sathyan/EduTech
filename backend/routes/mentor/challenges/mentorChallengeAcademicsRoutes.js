const express = require("express");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const {
    getMentorChallengeAcademics
} = require("../../../controllers/mentor/challenges/getMentorChallengeAcademicsController");

const router = express.Router();

// Get academic groups and subjects for connected students
router.get(
    "/",
    authMiddleware,
    roleMiddleware("mentor"),
    getMentorChallengeAcademics
);

module.exports = router;