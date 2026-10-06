// Defines mentor-student relationship routes

const express = require("express");

const {
    requestMentorship,
    getMentorRequests,
    acceptMentorship,
    rejectMentorship
} = require("../controllers/mentorStudentController");

const authMiddleware = require("../middleware/AuthMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// STUDENT → SEND MENTORSHIP REQUEST

router.post(
    "/request",
    authMiddleware,
    roleMiddleware("student"),
    requestMentorship
);


// MENTOR → VIEW MENTORSHIP REQUESTS

router.get(
    "/requests",
    authMiddleware,
    roleMiddleware("mentor"),
    getMentorRequests
);


// MENTOR → ACCEPT REQUEST

router.put(
    "/requests/:relationshipId/accept",
    authMiddleware,
    roleMiddleware("mentor"),
    acceptMentorship
);


// MENTOR → REJECT REQUEST

router.put(
    "/requests/:relationshipId/reject",
    authMiddleware,
    roleMiddleware("mentor"),
    rejectMentorship
);


module.exports = router;
