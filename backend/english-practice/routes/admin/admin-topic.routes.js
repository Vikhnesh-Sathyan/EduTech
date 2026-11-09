
const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const adminTopicController = require(
    "../controllers/admin-topic.controller"
);


// All routes require admin authentication
router.use(authMiddleware);
router.use(roleMiddleware("admin"));


// Create topic
router.post(
    "/",
    adminTopicController.createTopic
);


// Get all topics
router.get(
    "/",
    adminTopicController.getAllTopics
);


// Get topic by ID
router.get(
    "/:topicId",
    adminTopicController.getTopicById
);


// Update topic
router.put(
    "/:topicId",
    adminTopicController.updateTopic
);


// Activate or deactivate topic
router.patch(
    "/:topicId/status",
    adminTopicController.updateTopicStatus
);


// Delete topic
router.delete(
    "/:topicId",
    adminTopicController.deleteTopic
);


module.exports = router;
