
const db = require("../../config/db");


// Save a student's speaking attempt
const saveAttempt = async ({
    studentId,
    topicId,
    topicTitle,
    speechResult
}) => {

    const analysis = speechResult.analysis || {};

    const [result] = await db.execute(
        `INSERT INTO english_speaking_attempts
        (
            student_id,
            topic_id,
            topic_title,
            transcript,
            duration_seconds,
            word_count,
            speaking_speed,
            filler_count,
            repetition_count,
            pause_count,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            studentId,
            topicId || null,
            topicTitle,
            speechResult.transcript || null,
            Math.round(speechResult.duration_seconds || 0),
            analysis.total_words || 0,
            analysis.words_per_minute || 0,
            analysis.filler_word_count || 0,
            analysis.repetition_count || 0,
            analysis.pause_count || 0,
            "pending"
        ]
    );

    return {
        id: result.insertId,
        student_id: studentId,
        topic_id: topicId || null,
        topic_title: topicTitle,
        status: "pending"
    };
};


// Get a pending attempt belonging to the student
const getAttemptForEvaluation = async (
    attemptId,
    studentId
) => {

    const [rows] = await db.execute(
        `SELECT
            id,
            student_id,
            topic_title,
            transcript,
            status
         FROM english_speaking_attempts
         WHERE id = ?
         AND student_id = ?
         AND status = 'pending'`,
        [attemptId, studentId]
    );

    return rows[0] || null;
};


// Save AI evaluation
const saveEvaluation = async (
    attemptId,
    studentId,
    evaluation
) => {

    const [result] = await db.execute(
        `UPDATE english_speaking_attempts
         SET
            overall_score = ?,
            evaluation_result = ?,
            status = 'completed'
         WHERE id = ?
         AND student_id = ?
         AND status = 'pending'`,
        [
            evaluation.overall_score,
            JSON.stringify(evaluation),
            attemptId,
            studentId
        ]
    );

    return result.affectedRows > 0;
};


// Mark an attempt as failed
const markAttemptFailed = async (
    attemptId,
    studentId
) => {

    const [result] = await db.execute(
        `UPDATE english_speaking_attempts
         SET status = 'failed'
         WHERE id = ?
         AND student_id = ?
         AND status = 'pending'`,
        [
            attemptId,
            studentId
        ]
    );

    return result.affectedRows > 0;
};


// Get a student's speaking attempt history
const getStudentAttempts = async (studentId) => {

    const [rows] = await db.execute(
        `SELECT
            id,
            topic_id,
            topic_title,
            transcript,
            duration_seconds,
            word_count,
            speaking_speed,
            filler_count,
            repetition_count,
            pause_count,
            overall_score,
            evaluation_result,
            status,
            created_at
         FROM english_speaking_attempts
         WHERE student_id = ?
         ORDER BY created_at DESC`,
        [studentId]
    );

    return rows;
};

// Get one speaking attempt belonging to a student
const getStudentAttemptById = async (attemptId, studentId) => {

    const [rows] = await db.execute(
        `SELECT
            id,
            topic_id,
            topic_title,
            transcript,
            duration_seconds,
            word_count,
            speaking_speed,
            filler_count,
            repetition_count,
            pause_count,
            overall_score,
            evaluation_result,
            status,
            created_at
         FROM english_speaking_attempts
         WHERE id = ?
         AND student_id = ?
         LIMIT 1`,
        [attemptId, studentId]
    );

    const attempt = rows[0];

    if (!attempt) {
        return null;
    }

    // Convert the stored JSON string into an object
    if (typeof attempt.evaluation_result === "string") {
        attempt.evaluation_result = JSON.parse(
            attempt.evaluation_result
        );
    }

    return attempt;
};

module.exports = {
    saveAttempt,
    getAttemptForEvaluation,
    saveEvaluation,
    markAttemptFailed,
    getStudentAttempts,
    getStudentAttemptById
};
