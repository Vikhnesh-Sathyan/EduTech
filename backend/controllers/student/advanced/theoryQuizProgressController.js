const pool = require("../../../config/db");

// POST /api/student/advanced/theory-quizzes/:quizId/attempt/:attemptId/progress
const saveTheoryQuizProgress = async (req, res) => {
    let connection;

    try {
        const quizId = Number(req.params.quizId);
        const attemptId = Number(req.params.attemptId);
        const studentId = Number(req.user.id);

        const currentQuestionIndex = Number(
            req.body?.current_question_index
        );

        const answers = req.body?.answers ?? [];

        if (
            !Number.isInteger(quizId) || quizId <= 0 ||
            !Number.isInteger(attemptId) || attemptId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz or attempt ID"
            });
        }

        if (
            !Number.isInteger(currentQuestionIndex) ||
            currentQuestionIndex < 0 ||
            !Array.isArray(answers)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid progress data"
            });
        }

        const submittedByQuestion = new Map();

        for (const answer of answers) {
            const questionId = Number(answer?.question_id);

            if (
                !Number.isInteger(questionId) ||
                questionId <= 0 ||
                submittedByQuestion.has(questionId)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or duplicate question in progress data"
                });
            }

            let selectedOptionId = null;

            if (
                answer.selected_option_id !== null &&
                answer.selected_option_id !== undefined &&
                answer.selected_option_id !== ""
            ) {
                selectedOptionId = Number(answer.selected_option_id);

                if (
                    !Number.isInteger(selectedOptionId) ||
                    selectedOptionId <= 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid selected option ID"
                    });
                }
            }

            const markedForReview =
                answer.marked_for_review === true ||
                answer.marked_for_review === 1 ||
                answer.marked_for_review === "1";

            const hintUsed =
                answer.hint_used === true ||
                answer.hint_used === 1 ||
                answer.hint_used === "1";

            submittedByQuestion.set(questionId, {
                selectedOptionId,
                markedForReview: markedForReview ? 1 : 0,
                hintUsed: hintUsed ? 1 : 0
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

      const [attempts] = await connection.query(
    `SELECT id, status, deadline_at, current_question_index,
            (deadline_at <= NOW()) AS deadline_passed
     FROM advanced_theory_attempts
     WHERE id = ?
       AND quiz_id = ?
       AND student_id = ?
     FOR UPDATE`,
    [attemptId, quizId, studentId]
);

        if (attempts.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Quiz attempt not found"
            });
        }

        const attempt = attempts[0];

        if (attempt.status !== "in_progress") {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "This quiz attempt is no longer active"
            });
        }

if (Number(attempt.deadline_passed) === 1) {
    await connection.rollback();

    return res.status(409).json({
        success: false,
        message: "The quiz deadline has passed. Saved answers will be used for automatic submission."
    });
}
        const [snapshotQuestions] = await connection.query(
            `SELECT question_id, display_order
             FROM advanced_theory_attempt_questions
             WHERE attempt_id = ?
             ORDER BY display_order ASC`,
            [attemptId]
        );

        if (
            snapshotQuestions.length === 0 ||
            currentQuestionIndex >= snapshotQuestions.length
        ) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Invalid current question index"
            });
        }

        const questionIds = new Set(
            snapshotQuestions.map(question => Number(question.question_id))
        );

        const [snapshotOptions] = await connection.query(
            `SELECT question_id, option_id
             FROM advanced_theory_attempt_options
             WHERE attempt_id = ?`,
            [attemptId]
        );

        const optionsByQuestion = new Map();

        for (const option of snapshotOptions) {
            if (!optionsByQuestion.has(Number(option.question_id))) {
                optionsByQuestion.set(Number(option.question_id), new Set());
            }

            optionsByQuestion
                .get(Number(option.question_id))
                .add(Number(option.option_id));
        }

        for (const [questionId, answer] of submittedByQuestion) {
            if (!questionIds.has(questionId)) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Progress references a question outside this attempt"
                });
            }

            if (answer.selectedOptionId !== null) {
                const validOptions = optionsByQuestion.get(questionId);

                if (!validOptions?.has(answer.selectedOptionId)) {
                    await connection.rollback();

                    return res.status(400).json({
                        success: false,
                        message: "Selected option does not belong to this question"
                    });
                }
            }
        }

        for (const [questionId, answer] of submittedByQuestion) {
            await connection.query(
                `INSERT INTO advanced_theory_answers
                    (attempt_id, question_id, selected_option_id,
                     is_correct, marks_awarded, hint_used,
                     marked_for_review, answered_at)
                 VALUES (?, ?, ?, 0, 0, ?, ?, CURRENT_TIMESTAMP)
                 ON DUPLICATE KEY UPDATE
                    selected_option_id = VALUES(selected_option_id),
                    hint_used = VALUES(hint_used),
                    marked_for_review = VALUES(marked_for_review),
                    answered_at = CURRENT_TIMESTAMP`,
                [
                    attemptId,
                    questionId,
                    answer.selectedOptionId,
                    answer.hintUsed,
                    answer.markedForReview
                ]
            );
        }

        await connection.query(
            `UPDATE advanced_theory_attempts
             SET current_question_index = ?
             WHERE id = ?
               AND student_id = ?
               AND status = 'in_progress'`,
            [currentQuestionIndex, attemptId, studentId]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Quiz progress saved"
        });

    } catch (error) {
        if (connection) {
            await connection.rollback().catch(() => {});
        }

        console.error("Save theory quiz progress error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save quiz progress"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    saveTheoryQuizProgress
};