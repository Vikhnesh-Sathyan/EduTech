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
             JOIN mentor_profiles mp ON mp.mentor_id = msr.mentor_id
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

        if (!Number.isSafeInteger(conversationId) || conversationId <= 0) {
            return res.status(400).json({
                message: "Invalid conversation ID"
            });
        }

        const [conversations] = await db.query(
            `SELECT id, student_id, mentor_id
             FROM mentor_chat_conversations
             WHERE id = ?
               AND (student_id = ? OR mentor_id = ?)
             LIMIT 1`,
            [conversationId, userId, userId]
        );

        if (conversations.length === 0) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        const [messages] = await db.query(
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
             WHERE m.conversation_id = ?
             ORDER BY m.id ASC
             LIMIT 200`,
            [conversationId]
        );

        return res.status(200).json({
            messages
        });
    } catch (error) {
        console.error("Get chat messages error:", error);

        return res.status(500).json({
            message: "Unable to load chat messages"
        });
    }
};

module.exports = {
    getMyConversation,
    getConversationMessages
};