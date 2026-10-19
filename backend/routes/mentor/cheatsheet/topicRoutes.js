
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const {
    getTopics,
    createTopic,
    updateTopic,
    deleteTopic
} = require("../../../controllers/mentor/cheatsheet/topicController");

router.use(authMiddleware);
router.use(roleMiddleware("mentor"));

// GET topics for a category
router.get("/category/:categoryId", getTopics);

// CREATE topic under a category
router.post("/category/:categoryId", createTopic);

// UPDATE own topic
router.put("/:id", updateTopic);

// DELETE own topic
router.delete("/:id", deleteTopic);

module.exports = router;
