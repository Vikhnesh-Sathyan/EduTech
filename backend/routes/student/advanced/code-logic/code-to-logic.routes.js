
const express = require("express");
const router = express.Router();

// CODE TO LOGIC STUDENT CONTROLLER
const {
    getAvailableTasks,
    submitExplanation
} = require(
    "../../../../controllers/student/advanced/code-logic/student-code-logic.controller"
);

const authMiddleware = require(
    "../../../../middleware/authMiddleware"
);

const roleMiddleware = require(
    "../../../../middleware/roleMiddleware"
);

// ============================================
// CODE TO LOGIC STUDENT ROUTES
// ============================================

// GET PUBLISHED TASKS FROM THE ACCEPTED MENTOR
router.get(
    "/tasks",
    authMiddleware,
    roleMiddleware("student"),
    getAvailableTasks
);

// SUBMIT AN EXPLANATION FOR A TASK
router.post(
    "/tasks/:taskId/submit",
    authMiddleware,
    roleMiddleware("student"),
    submitExplanation
);

module.exports = router;
