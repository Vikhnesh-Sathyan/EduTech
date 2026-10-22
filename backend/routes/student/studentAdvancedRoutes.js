
const express = require("express");

const {
    getStudentAdvancedLearning
} = require("../../controllers/student/studentAdvancedController");

const {
    getAdvancedModuleProgress,
    completeAdvancedModule
} = require("../../controllers/student/advancedProgressController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

// Existing: GET Advanced Learning content
// GET /api/student/advanced/:subtopicId
router.get(
    "/:subtopicId",
    authMiddleware,
    roleMiddleware("student"),
    getStudentAdvancedLearning
);

// GET completion progress for a subtopic
// GET /api/student/advanced/:subtopicId/progress
router.get(
    "/:subtopicId/progress",
    authMiddleware,
    roleMiddleware("student"),
    getAdvancedModuleProgress
);

// Mark a module as completed
// POST /api/student/advanced/:subtopicId/modules/:moduleId/complete
router.post(
    "/:subtopicId/modules/:moduleId/complete",
    authMiddleware,
    roleMiddleware("student"),
    completeAdvancedModule
);

module.exports = router;
