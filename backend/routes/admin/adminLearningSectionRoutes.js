const express = require("express");

const {
    getLearningSections,
    createLearningSection,
    updateLearningSection,
    updateLearningSectionStatus
} = require("../../controllers/admin/adminLearningSectionController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();


// Get all sections for a subtopic
router.get(
    "/subtopic/:subtopicId",
    authMiddleware,
    roleMiddleware("admin"),
    getLearningSections
);


// Create a section
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createLearningSection
);


// Update a section
router.put(
    "/:sectionId",
    authMiddleware,
    roleMiddleware("admin"),
    updateLearningSection
);


// Enable or disable a section
router.patch(
    "/:sectionId/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateLearningSectionStatus
);


module.exports = router;

