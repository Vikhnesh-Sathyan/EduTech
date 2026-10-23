
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const { getStudentAdvancedLearning, getStudentAdvancedSections, getStudentAdvancedSubjects } = require("../../../controllers/student/advanced/studentAdvancedController");

router.get(
    "/sections",
    authMiddleware,
    roleMiddleware("student"),
    getStudentAdvancedSections
);

// Get Advanced Learning for one specific section.
router.get(
    "/section/:sectionId",
    authMiddleware,
    roleMiddleware("student"),
    getStudentAdvancedLearning
);

router.get(
  "/subjects",
  authMiddleware,
  roleMiddleware("student"),
  getStudentAdvancedSubjects
);

module.exports = router;
