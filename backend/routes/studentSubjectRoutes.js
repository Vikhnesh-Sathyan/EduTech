// Defines protected student subject routes

const express = require("express");

const {
    getAvailableSubjects,
    getSelectedSubjects,
    selectSubject,
    removeSubject,
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
// Get subjects already selected by the authenticated student
router.get(
    "/selected",
    authMiddleware,
    roleMiddleware("student"),
    getSelectedSubjects
);

// Remove a selected subject
router.delete(
    "/:subjectId",
    authMiddleware,
    roleMiddleware("student"),
    removeSubject
);

module.exports = router;