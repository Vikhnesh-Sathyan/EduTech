
const express = require("express");
const router = express.Router();

// CODE TO LOGIC STUDENT CONTROLLER
const {
    getAvailableTasks,
    getTaskDetails
} = require(
    "../../../../controllers/student/advanced/code-logic/student-code-logic.controller"
);

const {
    submitExplanation,
    getMySubmissions,
    getTaskSubmissionStatus
} = require(
    "../../../../controllers/student/advanced/code-logic/student-code-logic-submission.controller"
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

// GET ONE TASK'S DETAILS
router.get(
    "/tasks/:taskId",
    authMiddleware,
    roleMiddleware("student"),
    getTaskDetails
);

// SUBMIT AN EXPLANATION FOR A TASK
router.post(
    "/tasks/:taskId/submit",
    authMiddleware,
    roleMiddleware("student"),
    submitExplanation
);

// GET THE LOGGED-IN STUDENT'S SUBMISSION HISTORY
router.get(
    "/submissions",
    authMiddleware,
    roleMiddleware("student"),
    getMySubmissions
);

router.get(
  "/tasks/:taskId/submission-status",
  authMiddleware,
  roleMiddleware("student"),
  getTaskSubmissionStatus
);
module.exports = router;
