const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Register all chat-related Socket.IO functionality.
const registerChatSocket = (io) => {

    // 1. Authenticate socket connections using the existing JWT.
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

    // 2. Handle authenticated chat connections.
    io.on("connection", (socket) => {
        console.log(
            `Chat connected: ${socket.user.role} ${socket.user.id}`
        );

        // 3. Allow only conversation participants to join a room.
        socket.on("chat:join", async (data, callback) => {
            const reply =
                typeof callback === "function" ? callback : () => {};

            try {
                const conversationId = Number(data?.conversationId);

                if (
                    !Number.isSafeInteger(conversationId) ||
                    conversationId <= 0
                ) {
                    return reply({
                        success: false,
                        message: "Invalid conversation ID"
                    });
                }

                const [rows] = await db.query(
                    `SELECT id
                     FROM mentor_chat_conversations
                     WHERE id = ?
                       AND (student_id = ? OR mentor_id = ?)
                     LIMIT 1`,
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

                socket.join(`conversation_${conversationId}`);

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

        // 4. Save and broadcast a message.
        socket.on("chat:send", async (data, callback) => {
            const reply =
                typeof callback === "function" ? callback : () => {};

            try {
                const conversationId = Number(data?.conversationId);

                const message =
                    typeof data?.message === "string"
                        ? data.message.trim()
                        : "";

                if (
                    !Number.isSafeInteger(conversationId) ||
                    conversationId <= 0
                ) {
                    return reply({
                        success: false,
                        message: "Invalid conversation ID"
                    });
                }

                if (!message || message.length > 5000) {
                    return reply({
                        success: false,
                        message: "Message must contain 1–5000 characters"
                    });
                }

                // Verify that this user belongs to the conversation.
                const [rows] = await db.query(
                    `SELECT id
                     FROM mentor_chat_conversations
                     WHERE id = ?
                       AND (student_id = ? OR mentor_id = ?)
                     LIMIT 1`,
                    [
                        conversationId,
                        socket.user.id,
                        socket.user.id
                    ]
                );

                if (rows.length === 0) {
                    return reply({
                        success: false,
                        message: "You cannot send messages to this conversation"
                    });
                }

                // Require room membership before sending.
                if (!socket.rooms.has(`conversation_${conversationId}`)) {
                    return reply({
                        success: false,
                        message: "Join the conversation before sending a message"
                    });
                }

                // Persist the message before broadcasting it.
                const [result] = await db.query(
                    `INSERT INTO mentor_chat_messages
                        (conversation_id, sender_id, message)
                     VALUES (?, ?, ?)`,
                    [
                        conversationId,
                        socket.user.id,
                        message
                    ]
                );

                await db.query(
                    `UPDATE mentor_chat_conversations
                     SET updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?`,
                    [conversationId]
                );

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

                const savedMessage = savedMessages[0];

                io.to(`conversation_${conversationId}`).emit(
                    "chat:new-message",
                    savedMessage
                );

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

        // 5. Log socket disconnections.
        socket.on("disconnect", () => {
            console.log(
                `Chat disconnected: ${socket.user.role} ${socket.user.id}`
            );
        });
    });
};

module.exports = registerChatSocket;