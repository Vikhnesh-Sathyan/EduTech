const db = require("../../config/db");

// Get or create the chat conversation for the logged-in student
// and their currently assigned mentor.
const getMyConversation = async (req, res) => {
    try {
        const studentId = req.user.id;

        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can use this endpoint"
            });
        }

        const [relationships] = await db.query(
            `SELECT msr.mentor_id
             FROM mentor_student_relationships msr
             JOIN users u ON u.id = msr.mentor_id
             JOIN mentor_profiles mp ON mp.user_id = msr.mentor_id

             WHERE msr.student_id = ?
               AND msr.status = 'accepted'
               AND msr.is_active = TRUE
               AND u.role = 'mentor'
               AND u.status = 'active'
               AND mp.verification_status = 'approved'
             LIMIT 1`,
            [studentId]
        );

        if (relationships.length === 0) {
            return res.status(404).json({
                message: "You do not have an active mentor assigned"
            });
        }

        const mentorId = relationships[0].mentor_id;

        await db.query(
            `INSERT INTO mentor_chat_conversations
                (student_id, mentor_id)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE
                updated_at = CURRENT_TIMESTAMP`,
            [studentId, mentorId]
        );

        const [conversations] = await db.query(
            `SELECT
                c.id,
                c.student_id,
                c.mentor_id,
                student.name AS student_name,
                mentor.name AS mentor_name,
                c.created_at,
                c.updated_at
             FROM mentor_chat_conversations c
             JOIN users student ON student.id = c.student_id
             JOIN users mentor ON mentor.id = c.mentor_id
             WHERE c.student_id = ?
               AND c.mentor_id = ?
             LIMIT 1`,
            [studentId, mentorId]
        );

        return res.status(200).json({
            conversation: conversations[0]
        });
    } catch (error) {
        console.error("Get student chat conversation error:", error);

        return res.status(500).json({
            message: "Unable to load your chat conversation"
        });
    }
};

// Get the messages for a conversation.
// Only its student or mentor can access it.
const getConversationMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = Number(req.params.conversationId);

        // Validate conversation ID.
        if (
            !Number.isSafeInteger(conversationId) ||
            conversationId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid conversation ID"
            });
        }

        // Verify conversation access and check mentorship status.
        const [conversations] = await db.query(
            `
            SELECT
                c.id,
                c.student_id,
                c.mentor_id,

                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM mentor_student_relationships r
                        WHERE r.student_id = c.student_id
                          AND r.mentor_id = c.mentor_id
                          AND r.status = 'accepted'
                          AND r.is_active = 1
                    )
                    THEN 1
                    ELSE 0
                END AS is_active_mentorship

            FROM mentor_chat_conversations c

            WHERE c.id = ?
              AND (
                  c.student_id = ?
                  OR c.mentor_id = ?
              )

            LIMIT 1
            `,
            [conversationId, userId, userId]
        );

        // Only original participants can access this conversation.
        if (conversations.length === 0) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        const conversation = conversations[0];

        // Load existing conversation history.
        const [messages] = await db.query(
            `
            SELECT
                m.id,
                m.conversation_id,
                m.sender_id,
                u.name AS sender_name,
                m.message,
                m.is_read,
                m.created_at

            FROM mentor_chat_messages m

            JOIN users u
                ON u.id = m.sender_id

            WHERE m.conversation_id = ?

            ORDER BY m.id ASC

            LIMIT 200
            `,
            [conversationId]
        );

        // Return history and mentorship status.
        return res.status(200).json({
            conversation: {
                id: conversation.id,
                student_id: conversation.student_id,
                mentor_id: conversation.mentor_id,
                is_active_mentorship:
                    Number(conversation.is_active_mentorship)
            },
            messages
        });

    } catch (error) {
        console.error("Get chat messages error:", error);

        return res.status(500).json({
            message: "Unable to load chat messages"
        });
    }
};

// =====================================================
// MARK CONVERSATION MESSAGES AS READ
// =====================================================
// Marks messages sent by the other participant as read.
// The logged-in user cannot mark their own messages
// as received messages.
// =====================================================

const markMessagesAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = Number(req.params.conversationId);

        // Validate the conversation ID.
        if (
            !Number.isSafeInteger(conversationId) ||
            conversationId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID."
            });
        }

        // Confirm that the logged-in user belongs
        // to this conversation.
        const [conversations] = await db.query(
            `
            SELECT id
            FROM mentor_chat_conversations
            WHERE id = ?
              AND (student_id = ? OR mentor_id = ?)
            LIMIT 1
            `,
            [conversationId, userId, userId]
        );

        if (conversations.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You cannot access this conversation."
            });
        }

        // Mark only messages sent by the other participant.
        const [result] = await db.query(
            `
            UPDATE mentor_chat_messages
            SET is_read = 1
            WHERE conversation_id = ?
              AND sender_id != ?
              AND is_read = 0
            `,
            [conversationId, userId]
        );

        return res.status(200).json({
            success: true,
            message: "Messages marked as read.",
            updatedCount: result.affectedRows
        });

    } catch (error) {
        console.error("Mark messages as read error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to mark messages as read."
        });
    }
};


/**
 * Send a message in a chat conversation.
 * Only the student or mentor in that conversation can send messages.
 */
const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = Number(req.params.conversationId);
        const message =
            typeof req.body.message === "string"
                ? req.body.message.trim()
                : "";

        // Validate conversation ID.
        if (
            !Number.isSafeInteger(conversationId) ||
            conversationId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID."
            });
        }

        // Validate message content.
        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty."
            });
        }

        if (message.length > 5000) {
            return res.status(400).json({
                success: false,
                message: "Message cannot exceed 5000 characters."
            });
        }

        // Verify that the user belongs to this conversation.
        const [conversations] = await db.query(
            `SELECT id
             FROM mentor_chat_conversations
             WHERE id = ?
               AND (student_id = ? OR mentor_id = ?)
             LIMIT 1`,
            [conversationId, userId, userId]
        );

        if (conversations.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You cannot send messages in this conversation."
            });
        }

        // Save the message.
        const [result] = await db.query(
            `INSERT INTO mentor_chat_messages
                (conversation_id, sender_id, message)
             VALUES (?, ?, ?)`,
            [conversationId, userId, message]
        );

        // Update conversation activity for inbox sorting.
        await db.query(
            `UPDATE mentor_chat_conversations
             SET updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [conversationId]
        );

        // Return the saved message.
        const [savedMessages] = await db.query(
            `SELECT
                m.id,
                m.conversation_id,
                m.sender_id,
                u.name AS sender_name,
                m.message,
                m.is_read,
                m.created_at
             FROM mentor_chat_messages m
             JOIN users u ON u.id = m.sender_id
             WHERE m.id = ?
             LIMIT 1`,
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: "Message sent successfully.",
            data: savedMessages[0]
        });

    } catch (error) {
        console.error("Send chat message error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send message."
        });
    }
};


module.exports = {
    getMyConversation,
    getConversationMessages,
    markMessagesAsRead,
    sendMessage
};