
const pool = require("../../config/db");


// Create a new conversation session
const createSession = async (studentId, title = null) => {

    const [result] = await pool.execute(
        `INSERT INTO english_conversation_sessions
         (student_id, title)
         VALUES (?, ?)`,
        [studentId, title]
    );

    return result.insertId;
};


// Save a single message
const saveMessage = async (sessionId, role, content) => {

    const [result] = await pool.execute(
        `INSERT INTO english_conversation_messages
         (session_id, role, content)
         VALUES (?, ?, ?)`,
        [sessionId, role, content]
    );

    return result.insertId;
};


// Get all messages belonging to a session
const getMessages = async (sessionId) => {

    const [rows] = await pool.execute(
        `SELECT id, role, content, created_at
         FROM english_conversation_messages
         WHERE session_id = ?
         ORDER BY id ASC`,
        [sessionId]
    );

    return rows;
};


// Get all sessions belonging to a student
const getStudentSessions = async (studentId) => {

    const [rows] = await pool.execute(
        `SELECT id, title, status, created_at, updated_at
         FROM english_conversation_sessions
         WHERE student_id = ?
         ORDER BY updated_at DESC`,
        [studentId]
    );

    return rows;
};


// Get a session only if it belongs to the student
const getSessionById = async (sessionId, studentId) => {

    const [rows] = await pool.execute(
        `SELECT id, student_id, title, status
         FROM english_conversation_sessions
         WHERE id = ? AND student_id = ?`,
        [sessionId, studentId]
    );

    return rows[0] || null;
};


// Save student message and AI response together
const saveConversationTurn = async (
    sessionId,
    userMessage,
    aiResponse
) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        // Save student message
        await connection.execute(
            `INSERT INTO english_conversation_messages
             (session_id, role, content)
             VALUES (?, ?, ?)`,
            [sessionId, "user", userMessage]
        );

        // Save AI response
        await connection.execute(
            `INSERT INTO english_conversation_messages
             (session_id, role, content)
             VALUES (?, ?, ?)`,
            [sessionId, "model", aiResponse]
        );

        // Generate title from the first student message
        const title = userMessage.length > 60
            ? userMessage.substring(0, 57) + "..."
            : userMessage;

        // Update session activity
        await connection.execute(
            `UPDATE english_conversation_sessions
             SET
                title = COALESCE(title, ?),
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [title, sessionId]
        );

        await connection.commit();

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }

};


// Complete an active conversation session
const completeSession = async (sessionId, studentId) => {

    const [result] = await pool.execute(
        `UPDATE english_conversation_sessions
         SET status = 'completed',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?
           AND student_id = ?
           AND status = 'active'`,
        [sessionId, studentId]
    );

    return result.affectedRows > 0;

};


module.exports = {
    createSession,
    saveMessage,
    saveConversationTurn,
    getMessages,
    getStudentSessions,
    getSessionById,
    completeSession
};
