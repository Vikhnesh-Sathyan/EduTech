const express = require("express");
const router = express.Router();

const {
    getPublishedTasks,
    getPublishedTaskById,
    getMyTaskAttempts
} = require(
    "../../../../controllers/student/advanced/code-shuffle/codeShuffleStudentController"
);

const {
    submitCodeShuffleAttempt
} = require(
    "../../../../controllers/student/advanced/code-shuffle/codeShuffleSubmissionController"
);

const {
    saveActiveTaskOrder
} = require(
    "../../../../controllers/student/advanced/code-shuffle/codeShuffleActiveAttemptController"
);

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

// Get published Code Shuffle tasks.
router.get(
    "/tasks",
    authMiddleware,
    roleMiddleware("student"),
    getPublishedTasks
);

// Open one published Code Shuffle task.
router.get(
    "/tasks/:id",
    authMiddleware,
    roleMiddleware("student"),
    getPublishedTaskById
);

// Submit a Code Shuffle attempt.
router.post(
    "/tasks/:id/submit",
    authMiddleware,
    roleMiddleware("student"),
    submitCodeShuffleAttempt
);

// Get the logged-in student's attempts for a task.
router.get(
    "/tasks/:id/attempts",
    authMiddleware,
    roleMiddleware("student"),
    getMyTaskAttempts
);

router.patch(
    "/tasks/:id/order",
    authMiddleware,
    roleMiddleware("student"),
    saveActiveTaskOrder
);

module.exports = router;