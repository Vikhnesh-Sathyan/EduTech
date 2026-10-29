
const express = require("express");
const router = express.Router();

// CODE TO LOGIC MENTOR TASK CONTROLLER
const {
    createTask,
    getMyTasks
} = require(
    "../../../../controllers/mentor/advanced/code-logic/code-to-logic.controller"
);

// CODE TO LOGIC MENTOR REVIEW CONTROLLER
const {
    reviewSubmission
} = require(
    "../../../../controllers/mentor/advanced/code-logic/code-to-logic-review.controller"
);

const authMiddleware = require(
    "../../../../middleware/authMiddleware"
);

const roleMiddleware = require(
    "../../../../middleware/roleMiddleware"
);

// ============================================
// CODE TO LOGIC MENTOR ROUTES
// ============================================

// CREATE A TASK
router.post(
    "/tasks",
    authMiddleware,
    roleMiddleware("mentor"),
    createTask
);

// GET TASKS CREATED BY THE LOGGED-IN MENTOR
router.get(
    "/tasks",
    authMiddleware,
    roleMiddleware("mentor"),
    getMyTasks
);

// REVIEW A STUDENT SUBMISSION
router.patch(
    "/submissions/:submissionId/review",
    authMiddleware,
    roleMiddleware("mentor"),
    reviewSubmission
);

module.exports = router;
