const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
    getMentorChatInbox
} = require("../../controllers/chat/mentorChatController");

const {
    getMyConversation,
    getConversationMessages,
    markMessagesAsRead,
    sendMessage
} = require("../../controllers/chat/chatController");


// Get or create the logged-in student's conversation
router.get(
    "/my-conversation",
    authMiddleware,
    getMyConversation
);

// =====================================================
// MARK CHAT MESSAGES AS READ
// =====================================================
// PATCH /api/chat/:conversationId/read
// Marks messages received from the other participant
// as read.
// =====================================================

router.patch(
    "/:conversationId/read",
    authMiddleware,
    markMessagesAsRead
);

// Load messages for a conversation
router.get(
    "/:conversationId/messages",
    authMiddleware,
    getConversationMessages
);

// =====================================================
// MENTOR CHAT INBOX
// =====================================================
// GET /api/chat/mentor-inbox
// Allows mentors to view their student conversations.
// =====================================================

router.get(
    "/mentor-inbox",
    authMiddleware,
    getMentorChatInbox
);

// Send a message in a conversation.
// POST /api/chat/:conversationId/messages
router.post(
    "/:conversationId/messages",
    authMiddleware,
    sendMessage
);

module.exports = router;