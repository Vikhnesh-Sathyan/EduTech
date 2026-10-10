const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
    getMyConversation,
    getConversationMessages
} = require("../../controllers/chat/chatController");

// Get or create the logged-in student's conversation
router.get(
    "/my-conversation",
    authMiddleware,
    getMyConversation
);

// Load messages for a conversation
router.get(
    "/:conversationId/messages",
    authMiddleware,
    getConversationMessages
);

module.exports = router;