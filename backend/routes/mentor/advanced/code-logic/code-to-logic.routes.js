
const express = require("express");
const router = express.Router();

// MENTOR TASK CONTROLLER
const {
    createTask,
    getMyTasks
} = require(
    "../../../../controllers/mentor/advanced/code-logic/code-to-logic.controller"
);

// MENTOR REVIEW CONTROLLER
const {
    reviewSubmission,
    getTaskSubmissions
} = require(
    "../../../../controllers/mentor/advanced/code-logic/code-to-logic-review.controller"
);

// TASK MANAGEMENT CONTROLLER
const {
    getTaskById,
    updateTask,
    publishTask,
    deleteTask
} = require(
    "../../../../controllers/mentor/advanced/code-logic/code-to-logic-task-management.controller"
);

// MIDDLEWARE
const authMiddleware = require(
    "../../../../middleware/authMiddleware"
);

const roleMiddleware = require(
    "../../../../middleware/roleMiddleware"
);

// COMMON MENTOR AUTHENTICATION
const mentorAuth = [
    authMiddleware,
    roleMiddleware("mentor")
];

// ============================================
// CODE TO LOGIC MENTOR ROUTES
// ============================================

// CREATE TASK
router.post(
    "/tasks",
    ...mentorAuth,
    createTask
);

// GET ALL TASKS CREATED BY THE MENTOR
router.get(
    "/tasks",
    ...mentorAuth,
    getMyTasks
);

// VIEW ONE TASK
router.get(
    "/tasks/:taskId",
    ...mentorAuth,
    getTaskById
);

// UPDATE TASK
router.patch(
    "/tasks/:taskId",
    ...mentorAuth,
    updateTask
);

// PUBLISH DRAFT TASK
router.patch(
    "/tasks/:taskId/publish",
    ...mentorAuth,
    publishTask
);

// DELETE TASK
router.delete(
    "/tasks/:taskId",
    ...mentorAuth,
    deleteTask
);

// GET STUDENT SUBMISSIONS FOR A TASK
router.get(
    "/tasks/:taskId/submissions",
    ...mentorAuth,
    getTaskSubmissions
);

// REVIEW A STUDENT SUBMISSION
router.patch(
    "/submissions/:submissionId/review",
    ...mentorAuth,
    reviewSubmission
);

module.exports = router;
