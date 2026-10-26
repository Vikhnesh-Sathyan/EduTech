
const pool = require("../../../config/db");

// POST /api/student/advanced/theory-quizzes/:quizId/attempt/:attemptId/submit
const submitTheoryQuizAttempt = async (req, res) => {
    let connection;

    try {
        const quizId = Number(req.params.quizId);
        const attemptId = Number(req.params.attemptId);
        const studentId = Number(req.user.id);
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

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: "Answers must be an array"
            });
        }

        // Validate the submitted answer structure.
        const submittedByQuestion = new Map();

        for (const answer of answers) {
            if (!answer || typeof answer !== "object") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid answer data"
                });
            }

            const questionId = Number(answer.question_id);

            if (!Number.isInteger(questionId) || questionId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid question ID"
                });
            }

            if (submittedByQuestion.has(questionId)) {
                return res.status(400).json({
                    success: false,
                    message: "Duplicate answers for a question are not allowed"
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

            const hintUsed =
                answer.hint_used === true ||
                answer.hint_used === 1 ||
                answer.hint_used === "1";

            submittedByQuestion.set(questionId, {
                selectedOptionId,
                hintUsed
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Lock the attempt so concurrent submissions cannot both complete it.
        const [attempts] = await connection.query(
    `SELECT id, student_id, quiz_id, status,
            total_questions, total_marks, deadline_at,
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
                message: "Attempt not found"
            });
        }

        const attempt = attempts[0];

        if (attempt.status !== "in_progress") {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "This attempt has already been submitted or closed"
            });
        }

        const isAutoSubmit = req.body?.auto_submit === true;

const deadlinePassed =
    Number(attempt.deadline_passed) === 1;
    
if (deadlinePassed) {
    if (!isAutoSubmit) {
        await connection.rollback();

        return res.status(409).json({
            success: false,
            message: "The quiz deadline has passed"
        });
    }

    // After expiry, use only answers saved in the database.
    // Do not accept answer changes sent by the client after the deadline.
    const [savedAnswers] = await connection.query(
        `SELECT question_id, selected_option_id, hint_used
         FROM advanced_theory_answers
         WHERE attempt_id = ?`,
        [attemptId]
    );

    submittedByQuestion.clear();

    for (const saved of savedAnswers) {
        submittedByQuestion.set(Number(saved.question_id), {
            selectedOptionId:
                saved.selected_option_id == null
                    ? null
                    : Number(saved.selected_option_id),
            hintUsed: Number(saved.hint_used) === 1
        });
    }
}

        // Read the exact questions and correct answers saved at attempt start.
        const [snapshotQuestions] = await connection.query(
            `SELECT question_id, marks_snapshot, display_order
             FROM advanced_theory_attempt_questions
             WHERE attempt_id = ?
             ORDER BY display_order ASC`,
            [attemptId]
        );

        if (snapshotQuestions.length === 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "No question snapshots exist for this attempt"
            });
        }

        const [snapshotOptions] = await connection.query(
            `SELECT question_id, option_id, is_correct_snapshot
             FROM advanced_theory_attempt_options
             WHERE attempt_id = ?`,
            [attemptId]
        );

        const optionsByQuestion = new Map();

        for (const option of snapshotOptions) {
            if (!optionsByQuestion.has(option.question_id)) {
                optionsByQuestion.set(option.question_id, new Map());
            }

            optionsByQuestion
                .get(option.question_id)
                .set(option.option_id, Number(option.is_correct_snapshot));
        }

        const snapshotQuestionIds = new Set(
            snapshotQuestions.map(q => Number(q.question_id))
        );

        // Reject submitted questions or options not belonging to this attempt.
        for (const [questionId, answer] of submittedByQuestion) {
            if (!snapshotQuestionIds.has(questionId)) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "An answer references a question outside this attempt"
                });
            }

            if (answer.selectedOptionId !== null) {
                const questionOptions = optionsByQuestion.get(questionId);

                if (
                    !questionOptions ||
                    !questionOptions.has(answer.selectedOptionId)
                ) {
                    await connection.rollback();

                    return res.status(400).json({
                        success: false,
                        message: "A selected option does not belong to this attempt"
                    });
                }
            }
        }

        let correctAnswers = 0;
        let wrongAnswers = 0;
        let score = 0;
        let totalMarks = 0;

        // Save an answer row for every snapshot question.
        for (const question of snapshotQuestions) {
            const questionId = Number(question.question_id);
            const marks = Number(question.marks_snapshot || 0);
            const submitted = submittedByQuestion.get(questionId);

            const selectedOptionId = submitted?.selectedOptionId ?? null;
            const hintUsed = submitted?.hintUsed ? 1 : 0;

            const questionOptions = optionsByQuestion.get(questionId);

            if (!questionOptions || questionOptions.size === 0) {
                await connection.rollback();

                return res.status(409).json({
                    success: false,
                    message: `No option snapshots exist for question ${questionId}`
                });
            }

            const isCorrect =
                selectedOptionId !== null &&
                questionOptions.get(selectedOptionId) === 1;

            const marksAwarded = isCorrect ? marks : 0;

            totalMarks += marks;
            score += marksAwarded;

            if (isCorrect) {
                correctAnswers++;
            } else {
                // Includes unanswered questions, which receive zero marks.
                wrongAnswers++;
            }

           await connection.query(
    `INSERT INTO advanced_theory_answers
        (attempt_id, question_id, selected_option_id,
         is_correct, marks_awarded, hint_used)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
    selected_option_id = VALUES(selected_option_id),
    is_correct = VALUES(is_correct),
    marks_awarded = VALUES(marks_awarded),
    hint_used = VALUES(hint_used),
    answered_at = CURRENT_TIMESTAMP`,
    [
        attemptId,
        questionId,
        selectedOptionId,
        isCorrect ? 1 : 0,
        marksAwarded,
        hintUsed
    ]
);
        }

        const percentage = totalMarks > 0
            ? Number(((score / totalMarks) * 100).toFixed(2))
            : 0;

        await connection.query(
            `UPDATE advanced_theory_attempts
             SET total_questions = ?,
                 correct_answers = ?,
                 wrong_answers = ?,
                 score = ?,
                 total_marks = ?,
                 percentage = ?,
                 status = 'completed',
                 completed_at = CURRENT_TIMESTAMP
             WHERE id = ?
               AND student_id = ?
               AND status = 'in_progress'`,
            [
                snapshotQuestions.length,
                correctAnswers,
                wrongAnswers,
                score,
                totalMarks,
                percentage,
                attemptId,
                studentId
            ]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Quiz submitted successfully",
            result: {
                attempt_id: attemptId,
                total_questions: snapshotQuestions.length,
                correct_answers: correctAnswers,
                wrong_answers: wrongAnswers,
                score,
                total_marks: totalMarks,
                percentage,
                status: "completed"
            }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback().catch(() => {});
        }

        console.error("Submit theory quiz attempt error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit quiz attempt"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    submitTheoryQuizAttempt
};
