
const express = require("express");
const router = express.Router();

const {
    getAvailableLanguages,
    getMyTopics,
    createTopic,
    createTask,
    getMyTasks
} = require(
    "../../../../controllers/mentor/advanced/code-shuffle/codeShuffleController");

const {
    getTaskById
} = require(
    "../../../../controllers/mentor/advanced/code-shuffle/codeShuffleDetailsController"
);

const {
    updateTask
} = require(
    "../../../../controllers/mentor/advanced/code-shuffle/codeShuffleUpdateController"
);

const {
    publishTask,
    unpublishTask
} = require(
    "../../../../controllers/mentor/advanced/code-shuffle/codeShufflePublishController"
);

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

// =====================================================
// PROGRAMMING LANGUAGES
// =====================================================

router.get(
    "/languages",
    authMiddleware,
    roleMiddleware("mentor"),
    getAvailableLanguages
);

// =====================================================
// MENTOR TOPICS
// =====================================================

router.get(
    "/topics/mine",
    authMiddleware,
    roleMiddleware("mentor"),
    getMyTopics
);

router.post(
    "/topics",
    authMiddleware,
    roleMiddleware("mentor"),
    createTopic
);

// =====================================================
// MENTOR CODE SHUFFLE TASKS
// =====================================================

// Create a new task as a draft.
router.post(
    "/tasks",
    authMiddleware,
    roleMiddleware("mentor"),
    createTask
);

// Fetch tasks created by the logged-in mentor.
router.get(
    "/tasks/mine",
    authMiddleware,
    roleMiddleware("mentor"),
    getMyTasks
);

// Get details of a task owned by the logged-in mentor.
router.get(
    "/tasks/:id",
    authMiddleware,
    roleMiddleware("mentor"),
    getTaskById
);

// Update a draft Code Shuffle task.
router.put(
    "/tasks/:id",
    authMiddleware,
    roleMiddleware("mentor"),
    updateTask
);

// Publish a validated draft.
router.patch(
    "/tasks/:id/publish",
    authMiddleware,
    roleMiddleware("mentor"),
    publishTask
);

// Unpublish a task.
router.patch(
    "/tasks/:id/unpublish",
    authMiddleware,
    roleMiddleware("mentor"),
    unpublishTask
);

module.exports = router;
