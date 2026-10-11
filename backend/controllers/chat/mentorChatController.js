const db = require("../../config/db");

// =====================================================
// GET MENTOR CHAT INBOX
// =====================================================
// Allows a mentor to view all conversations with students,
// including conversations from previous mentorships.
//
// Active mentorship:
// - Conversation can be used for messaging.
//
// Inactive mentorship:
// - Conversation history remains accessible.
// - Frontend can use is_active_mentorship to disable
//   the message composer.
// =====================================================

const getMentorChatInbox = async (req, res) => {
    try {
        // Get the logged-in mentor's ID from the JWT.
        const mentorId = req.user.id;

        // Only mentors can access this inbox.
        if (req.user.role !== "mentor") {
            return res.status(403).json({
                success: false,
                message: "Only mentors can access the chat inbox."
            });
        }

        // Retrieve all conversations belonging to this mentor.
        // Do not filter out inactive mentorships because
        // previous conversation history must be preserved.
        const [conversations] = await db.query(
            `
            SELECT
                c.id AS conversation_id,
                c.student_id,
                c.mentor_id,

                u.name AS student_name,
                u.email AS student_email,

                c.updated_at,

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
                END AS is_active_mentorship,

                (
                    SELECT m.message
                    FROM mentor_chat_messages m
                    WHERE m.conversation_id = c.id
                    ORDER BY m.id DESC
                    LIMIT 1
                ) AS last_message,

                (
                    SELECT m.created_at
                    FROM mentor_chat_messages m
                    WHERE m.conversation_id = c.id
                    ORDER BY m.id DESC
                    LIMIT 1
                ) AS last_message_at,

                (
                    SELECT COUNT(*)
                    FROM mentor_chat_messages m
                    WHERE m.conversation_id = c.id
                      AND m.sender_id = c.student_id
                      AND m.is_read = 0
                ) AS unread_count

            FROM mentor_chat_conversations c

            INNER JOIN users u
                ON u.id = c.student_id

            WHERE c.mentor_id = ?

            ORDER BY
                COALESCE(
                    last_message_at,
                    c.updated_at
                ) DESC
            `,
            [mentorId]
        );

        // Return all conversations, including historical ones.
        return res.status(200).json({
            success: true,
            count: conversations.length,
            conversations
        });

    } catch (error) {
        console.error("Mentor chat inbox error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load mentor chat inbox."
        });
    }
};

// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {
    getMentorChatInbox
};