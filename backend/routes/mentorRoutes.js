// Defines protected mentor profile routes

const express = require("express");

const {
    getMentorProfile,
    saveMentorProfile,
    submitForVerification
} = require("../controllers/mentorController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("mentor"),
    getMentorProfile
);

router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("mentor"),
    saveMentorProfile
);

// Submit mentor profile for verification
router.put(
    "/profile/submit",
    authMiddleware,
    roleMiddleware("mentor"),
    submitForVerification
);

module.exports = router;