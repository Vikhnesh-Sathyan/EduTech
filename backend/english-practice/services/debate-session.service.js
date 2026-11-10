
const db = require("../../config/db");

// Create a new debate session
const createSession = async ({
    studentId,
    topic,
    studentPosition
}) => {

    const [result] = await db.execute(
        `INSERT INTO english_debate_sessions
        (
            student_id,
            topic,
            student_position,
            status
        )
        VALUES (?, ?, ?, 'active')`,
        [
            studentId,
            topic,
            studentPosition
        ]
    );

    return result.insertId;
};


// Save one debate conversation round
const saveArgument = async ({
    sessionId,
    sequenceNumber,
    studentArgument,
    aiResponse
}) => {

    const [result] = await db.execute(
        `INSERT INTO english_debate_arguments
        (
            session_id,
            sequence_number,
            student_argument,
            ai_response
        )
        VALUES (?, ?, ?, ?)`,
        [
            sessionId,
            sequenceNumber,
            studentArgument,
            aiResponse
        ]
    );

    return result.insertId;
};


// Get all arguments belonging to a debate session
const getSessionArguments = async (sessionId) => {

    const [rows] = await db.execute(
        `SELECT
            id,
            session_id,
            sequence_number,
            student_argument,
            ai_response,
            created_at
         FROM english_debate_arguments
         WHERE session_id = ?
         ORDER BY sequence_number ASC`,
        [sessionId]
    );

    return rows;
};


// Save evaluation and complete a debate session
const completeSession = async ({
    sessionId,
    overallScore,
    evaluationResult
}) => {

    const [result] = await db.execute(
        `UPDATE english_debate_sessions
         SET
            status = 'completed',
            overall_score = ?,
            evaluation_result = ?,
            evaluated_at = CURRENT_TIMESTAMP
         WHERE id = ?
         AND status = 'active'`,
        [
            overallScore,
            JSON.stringify(evaluationResult),
            sessionId
        ]
    );

    return result.affectedRows > 0;
};

// Abandon an active debate session
const abandonSession = async ({
    sessionId,
    studentId
}) => {

    const [result] = await db.execute(
        `UPDATE english_debate_sessions
         SET status = 'abandoned'
         WHERE id = ?
         AND student_id = ?
         AND status = 'active'`,
        [sessionId, studentId]
    );

    return result.affectedRows > 0;
};

// Get all debate sessions belonging to a student
const getStudentSessions = async (studentId) => {

    const [rows] = await db.execute(
        `SELECT
            id,
            topic,
            student_position,
            status,
            overall_score,
            evaluated_at,
            created_at,
            updated_at
         FROM english_debate_sessions
         WHERE student_id = ?
         ORDER BY created_at DESC`,
        [studentId]
    );

    return rows;
};


// Get complete details of one student's debate session
const getStudentSessionById = async (sessionId, studentId) => {

    const [rows] = await db.execute(
        `SELECT
            id,
            student_id,
            topic,
            student_position,
            status,
            overall_score,
            evaluation_result,
            evaluated_at,
            created_at,
            updated_at
         FROM english_debate_sessions
         WHERE id = ?
         AND student_id = ?
         LIMIT 1`,
        [
            sessionId,
            studentId
        ]
    );

    const session = rows[0];

    if (!session) {
        return null;
    }

    if (typeof session.evaluation_result === "string") {
        session.evaluation_result = JSON.parse(
            session.evaluation_result
        );
    }

    const argumentsList = await getSessionArguments(sessionId);

    return {
        ...session,
        arguments: argumentsList
    };
};



module.exports = {
    createSession,
    saveArgument,
    getSessionArguments,
    completeSession,
    abandonSession,
    getStudentSessions,
    getStudentSessionById
};