
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const {
    getTechnologies,
    getCategories,
    getTopics,
    getSubtopics
} = require("../../../controllers/student/cheatsheet/studentCheatsheetController");

// Student-only, read-only access
router.use(authMiddleware);
router.use(roleMiddleware("student"));

// GET technologies
router.get("/technologies", getTechnologies);

// GET categories for a technology
router.get("/technologies/:technologyId/categories", getCategories);

// GET topics for a category
router.get("/categories/:categoryId/topics", getTopics);

// GET subtopics for a topic
router.get("/topics/:topicId/subtopics", getSubtopics);

module.exports = router;
