const express = require("express");

const {
    getAvailableMentors,
    getMentorProfile
} = require("../controllers/studentMentorController");

const authMiddleware = require("../middleware/AuthMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Get approved mentors
router.get(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    getAvailableMentors
);


// Get one approved mentor profile
router.get(
    "/:mentorId",
    authMiddleware,
    roleMiddleware("student"),
    getMentorProfile
);


module.exports = router;
