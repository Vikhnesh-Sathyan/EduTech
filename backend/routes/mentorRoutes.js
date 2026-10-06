// Defines protected mentor routes
const express = require("express");

const {
    getMentorProfile,
    saveMentorProfile,
    submitForVerification
} = require("../controllers/mentorController");

const {
    getMentorDashboard
} = require("../controllers/mentorDashboardController");

const authMiddleware = require("../middleware/AuthMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// GET MENTOR PROFILE
// ==========================================

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("mentor"),
    getMentorProfile
);


// ==========================================
// SAVE MENTOR PROFILE
// ==========================================

router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("mentor"),
    saveMentorProfile
);


// ==========================================
// SUBMIT PROFILE FOR VERIFICATION
// ==========================================

router.put(
    "/profile/submit",
    authMiddleware,
    roleMiddleware("mentor"),
    submitForVerification
);


// ==========================================
// GET MENTOR DASHBOARD
// ==========================================

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("mentor"),
    getMentorDashboard
);


module.exports = router;
