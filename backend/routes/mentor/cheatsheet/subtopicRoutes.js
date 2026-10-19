
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const {
    getSubtopics,
    createSubtopic,
    updateSubtopic,
    deleteSubtopic
} = require("../../../controllers/mentor/cheatsheet/subtopicController");

router.use(authMiddleware);
router.use(roleMiddleware("mentor"));

// GET subtopics for a topic
router.get("/topic/:topicId", getSubtopics);

// CREATE subtopic under a topic
router.post("/topic/:topicId", createSubtopic);

// UPDATE own subtopic
router.put("/:id", updateSubtopic);

// DELETE own subtopic
router.delete("/:id", deleteSubtopic);

module.exports = router;
