const express = require("express");

const {
    getStudentSubjects,
    getSubjectById,
    getSubjectLearningStructure
} = require("../controllers/studyController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Get subjects for logged-in student
router.get(
    "/subjects",
    authMiddleware,
    roleMiddleware("student"),
    getStudentSubjects
);

// Get one subject for the logged-in student
router.get(
    "/subjects/:subjectId",
    authMiddleware,
    roleMiddleware("student"),
    getSubjectById
);

// Get learning structure for one subject
router.get(
    "/subjects/:subjectId/learning",
    authMiddleware,
    roleMiddleware("student"),
    getSubjectLearningStructure
);

module.exports = router;