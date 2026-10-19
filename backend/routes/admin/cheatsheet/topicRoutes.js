
const express = require("express");
const router = express.Router();

// Authentication and role middleware
const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// Topic controller
const {
    getTopics,
    createTopic,
    updateTopic,
    deleteTopic
} = require("../../../controllers/admin/cheatsheet/topicController");

// Admin-only access
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// GET topics for a category
router.get("/category/:categoryId", getTopics);

// CREATE topic under a category
router.post("/category/:categoryId", createTopic);

// UPDATE topic
router.put("/:id", updateTopic);

// DELETE topic
router.delete("/:id", deleteTopic);

module.exports = router;
