const express = require("express");

const {
    getAvailableMentors,
    getMentorProfile,
    getMyMentor,
    getPreviousMentors,
    getMentorRecommendations
} = require("../../controllers/student/studentMentorController");


const {
    createMentorQuestion,
    getMyMentorQuestions
} = require("../../controllers/student/studentMentorQuestionController");

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


// Ask the assigned mentor a question
router.post(
    "/questions",
    authMiddleware,
    roleMiddleware("student"),
    createMentorQuestion
);

// Get my mentor questions and responses
router.get(
    "/questions",
    authMiddleware,
    roleMiddleware("student"),
    getMyMentorQuestions
);


// Get one approved mentor profile
router.get(
    "/:mentorId",
    authMiddleware,
    roleMiddleware("student"),
    getMentorProfile
);



module.exports = router;




