
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const conversationController = require("../controllers/conversation.controller");


// Create a new conversation session
router.post(
    "/sessions",
    authMiddleware,
    roleMiddleware("student"),
    conversationController.createSession
);


// Get all conversation sessions
router.get(
    "/sessions",
    authMiddleware,
    roleMiddleware("student"),
    conversationController.getSessions
);


// Get messages from a specific session
router.get(
    "/sessions/:sessionId/messages",
    authMiddleware,
    roleMiddleware("student"),
    conversationController.getSessionMessages
);


// Complete an active conversation session
router.patch(
    "/sessions/:sessionId/complete",
    authMiddleware,
    roleMiddleware("student"),
    conversationController.completeSession
);


// Send a message and receive an AI response
router.post(
    "/chat",
    authMiddleware,
    roleMiddleware("student"),
    conversationController.chat
);


module.exports = router;
