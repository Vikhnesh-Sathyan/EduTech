const express = require("express");

const {
    getStudentSubjects,
    getSubjectById
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


module.exports = router;