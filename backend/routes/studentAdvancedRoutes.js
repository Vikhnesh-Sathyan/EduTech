const express = require("express");

const {
    getStudentAdvancedLearning
} = require("../controllers/studentAdvancedController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// GET /api/student/advanced/:subtopicId
router.get(
    "/:subtopicId",
    authMiddleware,
    roleMiddleware("student"),
    getStudentAdvancedLearning
);

module.exports = router;
