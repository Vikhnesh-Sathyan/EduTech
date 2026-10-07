const express = require("express");

const {
    requestMentorship,
    getMentorRequests,
    acceptMentorship,
    rejectMentorship,
    getStudentProfile
} = require("../controllers/mentorStudentController");

const authMiddleware = require("../middleware/AuthMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Student requests a mentor

router.post(
    "/request",
    authMiddleware,
    roleMiddleware("student"),
    requestMentorship
);


// Mentor receives student requests

router.get(
    "/requests",
    authMiddleware,
    roleMiddleware("mentor"),
    getMentorRequests
);


// Mentor views a student profile

router.get(
    "/students/:studentId",
    authMiddleware,
    roleMiddleware("mentor"),
    getStudentProfile
);


// Mentor accepts request

router.put(
    "/requests/:relationshipId/accept",
    authMiddleware,
    roleMiddleware("mentor"),
    acceptMentorship
);


// Mentor rejects request

router.put(
    "/requests/:relationshipId/reject",
    authMiddleware,
    roleMiddleware("mentor"),
    rejectMentorship
);


module.exports = router;
