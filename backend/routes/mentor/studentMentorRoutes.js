const express = require("express");

const {
    getAvailableMentors,
    getMentorProfile,
    getMyMentor,
    getPreviousMentors,
    getMentorRecommendations
} = require("../../controllers/student/studentMentorController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();


// Get approved mentors
router.get(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    getAvailableMentors
);

router.get(
    "/my-mentor",
    authMiddleware,
    roleMiddleware("student"),
    getMyMentor
);

router.get(
    "/previous",
    authMiddleware,
    roleMiddleware("student"),
    getPreviousMentors
);

router.get(
    "/recommendations",
    authMiddleware,
    roleMiddleware("student"),
    getMentorRecommendations
);

// Get one approved mentor profile
router.get(
    "/:mentorId",
    authMiddleware,
    roleMiddleware("student"),
    getMentorProfile
);



module.exports = router;




