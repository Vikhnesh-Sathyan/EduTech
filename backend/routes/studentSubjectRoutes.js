// Defines protected student subject routes

const express = require("express");

const {
    getAvailableSubjects,
    selectSubject
} = require("../controllers/studentSubjectController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Get subjects available to the authenticated student
router.get(
    "/available",
    authMiddleware,
    roleMiddleware("student"),
    getAvailableSubjects
);


// Select a subject
router.post(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    selectSubject
);


module.exports = router;