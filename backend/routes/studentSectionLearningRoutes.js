const express = require("express");

const {
    getSectionLearningContent
} = require("../controllers/studentSectionLearningController");

const {
    accessLearningSection,
    completeLearningSection
} = require("../controllers/studentStudyProgressController");

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Start / update progress when student opens a section
router.post(
    "/:sectionId/access",
    authMiddleware,
    roleMiddleware("student"),
    accessLearningSection
);


// Get learning content for one section

router.get(
    "/:sectionId",
    authMiddleware,
    roleMiddleware("student"),
    getSectionLearningContent
);


// Mark learning section as completed

router.put(
    "/:sectionId/complete",
    authMiddleware,
    roleMiddleware("student"),
    completeLearningSection
);


module.exports = router;