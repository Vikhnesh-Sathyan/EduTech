
const db = require("../../../config/db");

// ==========================================
// GET SUBJECT QUESTION BANK
// ==========================================

const getQuestionBankQuestions = async (req, res) => {
    try {
        const subjectId = Number(req.query.subject_id);

        if (!Number.isInteger(subjectId) || subjectId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid subject_id"
            });
        }

        // FETCH QUESTIONS AND OPTIONS

        const [rows] = await db.execute(
            `SELECT
                qb.id AS question_id,
                qb.subject_id,
                qb.question_text,
                qb.status,
                qb.created_at,
                qb.updated_at,

                qbo.id AS option_id,
                qbo.option_text,
                qbo.is_correct,
                qbo.option_order,

                EXISTS (
                    SELECT 1
                    FROM daily_quiz_questions dqq
                    WHERE dqq.source_question_id = qb.id
                ) AS is_used

             FROM question_bank_questions qb

             LEFT JOIN question_bank_options qbo
                ON qbo.question_id = qb.id

             WHERE qb.subject_id = ?

             ORDER BY qb.created_at DESC, qbo.option_order ASC`,
            [subjectId]
        );

        // GROUP OPTIONS UNDER EACH QUESTION

        const questionMap = new Map();

        for (const row of rows) {

            if (!questionMap.has(row.question_id)) {
                questionMap.set(row.question_id, {
                    question_id: row.question_id,
                    subject_id: row.subject_id,
                    question_text: row.question_text,
                    status: row.status,
                    is_used: Boolean(row.is_used),

                    // Used questions are permanently read-only.
                 can_edit: !Boolean(row.is_used) && row.status === "active",

can_archive: !Boolean(row.is_used) && row.status === "active",

can_restore: !Boolean(row.is_used) && row.status === "archived",

                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    options: []
                });
            }

            if (row.option_id !== null) {
                questionMap.get(row.question_id).options.push({
                    option_id: row.option_id,
                    option_text: row.option_text,
                    is_correct: Boolean(row.is_correct),
                    option_order: row.option_order
                });
            }
        }

        const questions = Array.from(questionMap.values());

        return res.status(200).json({
            success: true,
            message: "Question bank fetched successfully",
            total_questions: questions.length,
            active_questions: questions.filter(
                question => question.status === "active"
            ).length,
            archived_questions: questions.filter(
                question => question.status === "archived"
            ).length,
            used_questions: questions.filter(
                question => question.is_used
            ).length,
            unused_questions: questions.filter(
                question => !question.is_used &&
                    question.status === "active"
            ).length,
            data: questions
        });

    } catch (error) {
        console.error("Get question bank error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch question bank"
        });
    }
};


// ==========================================
// EDIT UNUSED QUESTION BANK QUESTION
// ==========================================

const updateQuestionBankQuestion = async (req, res) => {
    let connection;

    try {
        const questionId = Number(req.params.questionId);
        const { question_text, options } = req.body;

        if (!Number.isInteger(questionId) || questionId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid question ID"
            });
        }

        const questionText = question_text?.trim();

        if (!questionText) {
            return res.status(400).json({
                success: false,
                message: "Question text is required"
            });
        }

        // EXACTLY THREE OPTIONS

        if (!Array.isArray(options) || options.length !== 3) {
            return res.status(400).json({
                success: false,
                message: "Exactly three options are required"
            });
        }

        const normalizedOptions = [];

        for (const option of options) {
            const optionText = option.option_text?.trim();

            if (
                !optionText ||
                ![true, false, 0, 1].includes(option.is_correct)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Each option needs text and a valid correct-answer value"
                });
            }

            normalizedOptions.push({
                option_text: optionText,
                is_correct:
                    option.is_correct === true ||
                    option.is_correct === 1
            });
        }

        // CHECK UNIQUE OPTIONS

        const uniqueOptions = new Set(
            normalizedOptions.map(option =>
                option.option_text.toLowerCase()
            )
        );

        if (uniqueOptions.size !== 3) {
            return res.status(400).json({
                success: false,
                message: "All three options must be unique"
            });
        }

        // EXACTLY ONE CORRECT OPTION

        const correctCount = normalizedOptions.filter(
            option => option.is_correct
        ).length;

        if (correctCount !== 1) {
            return res.status(400).json({
                success: false,
                message: "Exactly one option must be correct"
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        // LOCK QUESTION RECORD

        const [questions] = await connection.execute(
            `SELECT id, subject_id, status
             FROM question_bank_questions
             WHERE id = ?
             FOR UPDATE`,
            [questionId]
        );

        if (questions.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        const question = questions[0];

        if (question.status !== "active") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Archived questions cannot be edited"
            });
        }

        // USED QUESTIONS ARE READ-ONLY

        const [usedQuestions] = await connection.execute(
            `SELECT id
             FROM daily_quiz_questions
             WHERE source_question_id = ?
             LIMIT 1`,
            [questionId]
        );

        if (usedQuestions.length > 0) {
            await connection.rollback();

            return res.status(403).json({
                success: false,
                message: "Used questions cannot be edited"
            });
        }

        // CHECK DUPLICATE QUESTION TEXT

        const [existingQuestions] = await connection.execute(
            `SELECT id, question_text
             FROM question_bank_questions
             WHERE subject_id = ?
               AND id != ?`,
            [question.subject_id, questionId]
        );

        const normalizeText = value =>
            value.trim().toLowerCase().replace(/\s+/g, " ");

        const duplicateExists = existingQuestions.some(
            item =>
                normalizeText(item.question_text) ===
                normalizeText(questionText)
        );

        if (duplicateExists) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "This question already exists in the subject"
            });
        }

        // VERIFY EXISTING THREE OPTIONS

        const [existingOptions] = await connection.execute(
            `SELECT id, option_order
             FROM question_bank_options
             WHERE question_id = ?
             ORDER BY option_order
             FOR UPDATE`,
            [questionId]
        );

        if (
            existingOptions.length !== 3 ||
            ![1, 2, 3].every(order =>
                existingOptions.some(
                    option => Number(option.option_order) === order
                )
            )
        ) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "Existing question options are incomplete. Cannot safely edit."
            });
        }

        // UPDATE QUESTION

        await connection.execute(
            `UPDATE question_bank_questions
             SET question_text = ?
             WHERE id = ?`,
            [questionText, questionId]
        );

        // UPDATE EXISTING OPTIONS
        // Preserve option IDs and unique option orders.

        for (let index = 0; index < normalizedOptions.length; index++) {
            const option = normalizedOptions[index];

            await connection.execute(
                `UPDATE question_bank_options
                 SET option_text = ?,
                     is_correct = ?
                 WHERE question_id = ?
                   AND option_order = ?`,
                [
                    option.option_text,
                    option.is_correct ? 1 : 0,
                    questionId,
                    index + 1
                ]
            );
        }

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Question updated successfully",
            question_id: questionId
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Update question bank error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update question"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


 // ==========================================
// ARCHIVE UNUSED QUESTION
// ==========================================

const archiveQuestionBankQuestion = async (req, res) => {
    try {
        const questionId = Number(req.params.questionId);

        if (!Number.isInteger(questionId) || questionId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid question ID"
            });
        }

        const [result] = await db.execute(
            `UPDATE question_bank_questions qb
             SET qb.status = 'archived'
             WHERE qb.id = ?
               AND qb.status = 'active'
               AND NOT EXISTS (
                   SELECT 1
                   FROM daily_quiz_questions dqq
                   WHERE dqq.source_question_id = qb.id
               )`,
            [questionId]
        );

        if (result.affectedRows === 0) {
            return res.status(409).json({
                success: false,
                message: "Question not found, already archived, or has been used in a quiz"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Question archived successfully"
        });

    } catch (error) {
        console.error("Archive question error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to archive question"
        });
    }
};


 // ==========================================
// RESTORE ARCHIVED QUESTION
// ==========================================

const restoreQuestionBankQuestion = async (req, res) => {
    try {
        const questionId = Number(req.params.questionId);

        if (!Number.isInteger(questionId) || questionId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid question ID"
            });
        }

        const [result] = await db.execute(
            `UPDATE question_bank_questions qb
             SET qb.status = 'active'
             WHERE qb.id = ?
               AND qb.status = 'archived'
               AND NOT EXISTS (
                   SELECT 1
                   FROM daily_quiz_questions dqq
                   WHERE dqq.source_question_id = qb.id
               )`,
            [questionId]
        );

        if (result.affectedRows === 0) {
            return res.status(409).json({
                success: false,
                message: "Question not found, already active, or has been used in a quiz"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Question restored successfully"
        });

    } catch (error) {
        console.error("Restore question error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to restore question"
        });
    }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    getQuestionBankQuestions,
    updateQuestionBankQuestion,
    archiveQuestionBankQuestion,
    restoreQuestionBankQuestion
};
