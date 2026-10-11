const jwt = require("jsonwebtoken");
const db = require("../config/db");

// =====================================================
// REGISTER CHAT SOCKET
// =====================================================
// Handles:
// 1. Socket authentication.
// 2. Joining conversations.
// 3. Sending and broadcasting messages.
// 4. Marking messages as read.
// 5. Preserving historical conversations as read-only
//    when a mentorship is no longer active.
// =====================================================

const registerChatSocket = (io) => {

    // =====================================================
    // 1. AUTHENTICATE SOCKET CONNECTION
    // =====================================================

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(
                    new Error("Authentication token is required")
                );
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            if (
                !decoded.id ||
                !["student", "mentor"].includes(decoded.role)
            ) {
                return next(
                    new Error("Invalid chat authentication")
                );
            }

            socket.user = {
                id: decoded.id,
                role: decoded.role
            };

            next();

        } catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    // =====================================================
    // 2. HANDLE AUTHENTICATED CONNECTIONS
    // =====================================================

    io.on("connection", (socket) => {

        console.log(
            `Chat connected: ${socket.user.role} ${socket.user.id}`
        );

        // =====================================================
        // 3. JOIN CONVERSATION
        // =====================================================
        // Original participants can access their conversation
        // history even after their mentorship becomes inactive.
        // =====================================================

        socket.on("chat:join", async (data, callback) => {

            const reply =
                typeof callback === "function"
                    ? callback
                    : () => {};

            try {
                const conversationId = Number(
                    data?.conversationId
                );

                if (
                    !Number.isSafeInteger(conversationId) ||
                    conversationId <= 0
                ) {
                    return reply({
                        success: false,
                        message: "Invalid conversation ID"
                    });
                }

                // Verify that the user is an original participant.
                const [rows] = await db.query(
                    `
                    SELECT id
                    FROM mentor_chat_conversations
                    WHERE id = ?
                      AND (
                          student_id = ?
                          OR mentor_id = ?
                      )
                    LIMIT 1
                    `,
                    [
                        conversationId,
                        socket.user.id,
                        socket.user.id
                    ]
                );

                if (rows.length === 0) {
                    return reply({
                        success: false,
                        message: "You cannot access this conversation"
                    });
                }

                // Allow access to the conversation room so
                // historical messages remain accessible.
                socket.join(
                    `conversation_${conversationId}`
                );

                return reply({
                    success: true,
                    conversationId
                });

            } catch (error) {
                console.error("Chat join error:", error);

                return reply({
                    success: false,
                    message: "Unable to join conversation"
                });
            }
        });

        // =====================================================
        // 4. SEND MESSAGE
        // =====================================================
        // Messages can only be sent when the mentorship
        // relationship is currently accepted and active.
        //
        // Historical conversations remain readable, but
        // new messages are rejected for inactive relationships.
        // =====================================================

        socket.on("chat:send", async (data, callback) => {

            const reply =
                typeof callback === "function"
                    ? callback
                    : () => {};

            try {
                const conversationId = Number(
                    data?.conversationId
                );

                const message =
                    typeof data?.message === "string"
                        ? data.message.trim()
                        : "";

                // Validate conversation ID.
                if (
                    !Number.isSafeInteger(conversationId) ||
                    conversationId <= 0
                ) {
                    return reply({
                        success: false,
                        message: "Invalid conversation ID"
                    });
                }

                // Validate message content.
                if (!message || message.length > 5000) {
                    return reply({
                        success: false,
                        message:
                            "Message must contain 1–5000 characters"
                    });
                }

                // Verify conversation membership and check
                // whether the mentorship is currently active.
                const [rows] = await db.query(
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
                    [
                        conversationId,
                        socket.user.id,
                        socket.user.id
                    ]
                );

                // Reject users who are not participants.
                if (rows.length === 0) {
                    return reply({
                        success: false,
                        message:
                            "You cannot send messages to this conversation"
                    });
                }

                // Block sending messages in historical conversations.
                if (
                    Number(rows[0].is_active_mentorship) !== 1
                ) {
                    return reply({
                        success: false,
                        message:
                            "This conversation is read-only because the mentorship is no longer active."
                    });
                }

                // Require room membership before sending.
                if (
                    !socket.rooms.has(
                        `conversation_${conversationId}`
                    )
                ) {
                    return reply({
                        success: false,
                        message:
                            "Join the conversation before sending a message"
                    });
                }

                // Save the message to the database.
                const [result] = await db.query(
                    `
                    INSERT INTO mentor_chat_messages
                        (
                            conversation_id,
                            sender_id,
                            message
                        )
                    VALUES (?, ?, ?)
                    `,
                    [
                        conversationId,
                        socket.user.id,
                        message
                    ]
                );

                // Update conversation activity.
                await db.query(
                    `
                    UPDATE mentor_chat_conversations
                    SET updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                    `,
                    [conversationId]
                );

                // Retrieve the saved message with sender details.
                const [savedMessages] = await db.query(
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

                    INNER JOIN users u
                        ON u.id = m.sender_id

                    WHERE m.id = ?

                    LIMIT 1
                    `,
                    [result.insertId]
                );

                if (savedMessages.length === 0) {
                    return reply({
                        success: false,
                        message:
                            "Message was saved but could not be retrieved"
                    });
                }

                const savedMessage = savedMessages[0];

                // Broadcast the saved message to conversation participants.
                io.to(`conversation_${conversationId}`).emit(
                    "chat:new-message",
                    savedMessage
                );

                // Confirm successful delivery to the sender.
                return reply({
                    success: true,
                    message: savedMessage
                });

            } catch (error) {
                console.error("Chat send error:", error);

                return reply({
                    success: false,
                    message: "Unable to send message"
                });
            }
        });

        // =====================================================
        // 5. MARK MESSAGES AS READ
        // =====================================================
        // Original participants can mark messages as read,
        // including messages in historical conversations.
        // =====================================================

        socket.on("chat:mark-read", async (data, callback) => {

            const reply =
                typeof callback === "function"
                    ? callback
                    : () => {};

            try {
                const conversationId = Number(
                    data?.conversationId
                );

                // Validate conversation ID.
                if (
                    !Number.isSafeInteger(conversationId) ||
                    conversationId <= 0
                ) {
                    return reply({
                        success: false,
                        message: "Invalid conversation ID."
                    });
                }

                // Verify that the user is a conversation participant.
                const [conversations] = await db.query(
                    `
                    SELECT id
                    FROM mentor_chat_conversations
                    WHERE id = ?
                      AND (
                          student_id = ?
                          OR mentor_id = ?
                      )
                    LIMIT 1
                    `,
                    [
                        conversationId,
                        socket.user.id,
                        socket.user.id
                    ]
                );

                if (conversations.length === 0) {
                    return reply({
                        success: false,
                        message:
                            "You cannot access this conversation."
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
                    [
                        conversationId,
                        socket.user.id
                    ]
                );

                // Notify the other participant in real time.
                socket.to(
                    `conversation_${conversationId}`
                ).emit(
                    "chat:messages-read",
                    {
                        conversationId,
                        readerId: socket.user.id,
                        updatedCount: result.affectedRows
                    }
                );

                return reply({
                    success: true,
                    updatedCount: result.affectedRows
                });

            } catch (error) {
                console.error(
                    "Socket mark-read error:",
                    error
                );

                return reply({
                    success: false,
                    message:
                        "Unable to mark messages as read."
                });
            }
        });

        // =====================================================
        // 6. HANDLE DISCONNECTION
        // =====================================================

        socket.on("disconnect", () => {
            console.log(
                `Chat disconnected: ${socket.user.role} ${socket.user.id}`
            );
        });

    });
};

// =====================================================
// EXPORT SOCKET REGISTRATION
// =====================================================

module.exports = registerChatSocket;