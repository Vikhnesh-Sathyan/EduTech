// Defines protected admin subject routes

const express = require("express");

const {
    createSubject,
    getSubjects,
    getSubjectsByYear,
    updateSubject,
    updateSubjectStatus
} = require("../controllers/subjectController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Create a subject
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createSubject
);


// Get subjects for an education year
router.get(
    "/year/:yearId",
    authMiddleware,
    roleMiddleware("admin"),
    getSubjectsByYear
);

// Get all subjects for admin management

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getSubjects
);


// Update a subject
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateSubject
);


// Activate or deactivate a subject
router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateSubjectStatus
);


module.exports = router;