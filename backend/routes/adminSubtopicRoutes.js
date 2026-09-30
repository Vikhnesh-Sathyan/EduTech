const express = require("express");

const {
    getSubtopics,
    createSubtopic,
    updateSubtopic,
    updateSubtopicStatus
} = require("../controllers/adminSubtopicController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Get all subtopics for a topic
router.get(
    "/topic/:topicId",
    authMiddleware,
    roleMiddleware("admin"),
    getSubtopics
);


// Create a subtopic
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createSubtopic
);


// Update a subtopic
router.put(
    "/:subtopicId",
    authMiddleware,
    roleMiddleware("admin"),
    updateSubtopic
);


// Enable / disable a subtopic
router.patch(
    "/:subtopicId/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateSubtopicStatus
);


module.exports = router;