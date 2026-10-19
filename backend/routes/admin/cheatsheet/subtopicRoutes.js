
const express = require("express");
const router = express.Router();

// Authentication and role middleware
const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// Subtopic controller
const {
    getSubtopics,
    createSubtopic,
    updateSubtopic,
    deleteSubtopic
} = require("../../../controllers/admin/cheatsheet/subtopicController");

// Admin-only access
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// GET subtopics for a topic
router.get("/topic/:topicId", getSubtopics);

// CREATE subtopic under a topic
router.post("/topic/:topicId", createSubtopic);

// UPDATE subtopic
router.put("/:id", updateSubtopic);

// DELETE subtopic
router.delete("/:id", deleteSubtopic);

module.exports = router;
