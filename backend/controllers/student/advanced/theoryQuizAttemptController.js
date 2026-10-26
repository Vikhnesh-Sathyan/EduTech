
const pool = require("../../../config/db");

// Randomizes an array using Fisher–Yates shuffle.
const shuffleArray = (items) => {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [
            shuffled[j],
            shuffled[i]
        ];
    }

    return shuffled;
};

// Starts/resumes an attempt and loads database-saved progress.
const startOrResumeAttempt = async (req, res) => {
    let connection;

    try {
        const quizId = Number(req.params.quizId);
        const studentId = Number(req.user.id);

        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID"
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Verify the quiz is published and available to this student.
        const [quizzes] = await connection.query(
            `SELECT q.id, q.title, q.description, q.pass_percentage
             FROM advanced_theory_quizzes q
             WHERE q.id = ?
               AND q.status = 'published'
               AND EXISTS (
                   SELECT 1
                   FROM student_profiles sp
                   WHERE sp.user_id = ?
                     AND sp.education_program_id = q.education_program_id
                     AND sp.department_id = q.department_id
                     AND sp.education_year_id = q.education_year_id
                     AND EXISTS (
                         SELECT 1
                         FROM student_subjects ss
                         WHERE ss.student_id = sp.user_id
                           AND ss.subject_id = q.subject_id
                     )
               )
             FOR UPDATE`,
            [quizId, studentId]
        );

        if (quizzes.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Published quiz not found for this student"
            });
        }

        // First, resume an attempt that is still in progress.
        const [existingAttempts] = await connection.query(
            `SELECT id, attempt_number, total_questions,
                    total_marks, status, started_at, deadline_at,
                    current_question_index
             FROM advanced_theory_attempts
             WHERE student_id = ?
               AND quiz_id = ?
               AND status = 'in_progress'
             ORDER BY attempt_number DESC
             LIMIT 1
             FOR UPDATE`,
            [studentId, quizId]
        );

        let attempt = existingAttempts[0];
        let isNewAttempt = false;
        let isCompletedAttempt = false;

        // If no attempt is in progress, inspect the latest attempt.
        if (!attempt) {
            const [latestAttempts] = await connection.query(
                `SELECT id, attempt_number, total_questions,
                        total_marks, status, started_at, deadline_at,
                        current_question_index
                 FROM advanced_theory_attempts
                 WHERE student_id = ?
                   AND quiz_id = ?
                 ORDER BY attempt_number DESC
                 LIMIT 1
                 FOR UPDATE`,
                [studentId, quizId]
            );

            const latestAttempt = latestAttempts[0];

            if (latestAttempt?.status === "completed") {
                // Do not create another attempt just because of refresh.
                attempt = latestAttempt;
                isCompletedAttempt = true;
            }
        }

        // Create a new attempt only when no attempt exists to resume
        // and the latest attempt is not completed.
        if (!attempt) {
            const [questions] = await connection.query(
                `SELECT id, question_text, explanation,
                        concept_tag, marks, display_order
                 FROM advanced_theory_questions
                 WHERE quiz_id = ?
                   AND status = 'active'
                 ORDER BY display_order ASC, id ASC
                 LIMIT 20`,
                [quizId]
            );

            if (questions.length === 0) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "This quiz has no active questions"
                });
            }
                    // Shuffle question order for this new attempt.
const originalQuestionOrder = questions.map(q => q.id);

questions.splice(0, questions.length, ...shuffleArray(questions));

console.log("NEW ATTEMPT CREATED — question order:", {
    original: originalQuestionOrder,
    shuffled: questions.map(q => q.id)
});

            const questionIds = questions.map(q => q.id);
            const placeholders = questionIds.map(() => "?").join(", ");

            const [options] = await connection.query(
                `SELECT id, question_id, option_text,
                        is_correct, display_order
                 FROM advanced_theory_options
                 WHERE question_id IN (${placeholders})
                 ORDER BY display_order ASC, id ASC`,
                questionIds
            );

            const optionsByQuestion = {};

            for (const option of options) {
                if (!optionsByQuestion[option.question_id]) {
                    optionsByQuestion[option.question_id] = [];
                }

                optionsByQuestion[option.question_id].push(option);
            }

            // Every question must have at least one option.
            const invalidQuestion = questions.find(
                q => !(optionsByQuestion[q.id] || []).length
            );

            if (invalidQuestion) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: `Question ${invalidQuestion.id} has no options`
                });
            }

            const [attemptCount] = await connection.query(
                `SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_number
                 FROM advanced_theory_attempts
                 WHERE student_id = ? AND quiz_id = ?`,
                [studentId, quizId]
            );

            const totalMarks = questions.reduce(
                (sum, q) => sum + Number(q.marks || 0),
                0
            );

            // Uses a 20-minute deadline for now.
            const [insertResult] = await connection.query(
                `INSERT INTO advanced_theory_attempts
                    (student_id, quiz_id, attempt_number,
                     total_questions, total_marks, status,
                     started_at, deadline_at)
                 VALUES (?, ?, ?, ?, ?, 'in_progress',
                         CURRENT_TIMESTAMP,
                         DATE_ADD(NOW(), INTERVAL 20 MINUTE))`,
                [
                    studentId,
                    quizId,
                    attemptCount[0].next_number,
                    questions.length,
                    totalMarks
                ]
            );

            const attemptId = insertResult.insertId;

            // Save immutable question and option snapshots.
            for (let i = 0; i < questions.length; i++) {
                const question = questions[i];
                const questionOrder = i + 1;

                await connection.query(
                    `INSERT INTO advanced_theory_attempt_questions
                        (attempt_id, question_id, question_text_snapshot,
                         explanation_snapshot, concept_tag_snapshot,
                         marks_snapshot, display_order)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        attemptId,
                        question.id,
                        question.question_text,
                        question.explanation,
                        question.concept_tag,
                        question.marks,
                        questionOrder
                    ]
                );

                // Shuffle options independently for each question.
const questionOptions = shuffleArray(
    optionsByQuestion[question.id]
);

                for (let j = 0; j < questionOptions.length; j++) {
                    const option = questionOptions[j];

                    await connection.query(
                        `INSERT INTO advanced_theory_attempt_options
                            (attempt_id, question_id, option_id,
                             option_text_snapshot, is_correct_snapshot,
                             display_order)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            attemptId,
                            question.id,
                            option.id,
                            option.option_text,
                            Number(option.is_correct),
                            j + 1
                        ]
                    );
                }
            }

            const [createdAttempts] = await connection.query(
                `SELECT id, attempt_number, total_questions,
                        total_marks, status, started_at, deadline_at,
                        current_question_index
                 FROM advanced_theory_attempts
                 WHERE id = ? AND student_id = ?`,
                [attemptId, studentId]
            );

            attempt = createdAttempts[0];
            isNewAttempt = true;
        }

        // Load saved snapshots for the selected attempt.
        const [snapshotQuestions] = await connection.query(
            `SELECT question_id AS id,
                    question_text_snapshot AS question_text,
                    concept_tag_snapshot AS concept_tag,
                    marks_snapshot AS marks,
                    display_order
             FROM advanced_theory_attempt_questions
             WHERE attempt_id = ?
             ORDER BY display_order ASC`,
            [attempt.id]
        );

        const [snapshotOptions] = await connection.query(
            `SELECT question_id,
                    option_id AS id,
                    option_text_snapshot AS option_text,
                    display_order
             FROM advanced_theory_attempt_options
             WHERE attempt_id = ?
             ORDER BY question_id, display_order ASC`,
            [attempt.id]
        );

        const [savedAnswers] = await connection.query(
            `SELECT question_id,
                    selected_option_id,
                    marked_for_review,
                    hint_used
             FROM advanced_theory_answers
             WHERE attempt_id = ?`,
            [attempt.id]
        );

        const snapshotOptionsByQuestion = {};

        for (const option of snapshotOptions) {
            if (!snapshotOptionsByQuestion[option.question_id]) {
                snapshotOptionsByQuestion[option.question_id] = [];
            }

            snapshotOptionsByQuestion[option.question_id].push({
                id: option.id,
                option_text: option.option_text
            });
        }

        const responseQuestions = snapshotQuestions.map(question => ({
            ...question,
            options: snapshotOptionsByQuestion[question.id] || []
        }));

        await connection.commit();

        return res.status(isNewAttempt ? 201 : 200).json({
            success: true,
            message: isNewAttempt
                ? "Attempt started and question snapshots saved"
                : isCompletedAttempt
                    ? "This quiz attempt is already completed"
                    : "Existing attempt resumed",
            quiz: quizzes[0],
            attempt,
            questions: responseQuestions,
            savedAnswers
        });

    } catch (error) {
        if (connection) {
            await connection.rollback().catch(() => {});
        }

        console.error("Start or resume theory attempt error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to start or resume quiz attempt"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Checks the student's latest attempt without creating a new attempt.
const getTheoryQuizAttemptStatus = async (req, res) => {
    try {
        const quizId = Number(req.params.quizId);
        const studentId = Number(req.user.id);

        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID"
            });
        }

const [attempts] = await pool.query(
    `SELECT
        a.id,
        a.attempt_number,
        a.status,
        a.deadline_at,
        a.current_question_index,
        a.total_questions,
        a.correct_answers,
        a.wrong_answers,
        a.score,
        a.total_marks,
        a.percentage,
        a.started_at,
        a.completed_at,

        COUNT(DISTINCT CASE
            WHEN ans.selected_option_id IS NOT NULL
            THEN aq.question_id
        END) AS attempted_questions,

        GREATEST(
            a.total_questions - COUNT(DISTINCT CASE
                WHEN ans.selected_option_id IS NOT NULL
                THEN aq.question_id
            END),
            0
        ) AS not_attempted_questions

    FROM advanced_theory_attempts a

    LEFT JOIN advanced_theory_attempt_questions aq
        ON aq.attempt_id = a.id

    LEFT JOIN advanced_theory_answers ans
        ON ans.attempt_id = aq.attempt_id
        AND ans.question_id = aq.question_id

    WHERE a.student_id = ?
      AND a.quiz_id = ?

    GROUP BY
        a.id,
        a.attempt_number,
        a.status,
        a.deadline_at,
        a.current_question_index,
        a.total_questions,
        a.correct_answers,
        a.wrong_answers,
        a.score,
        a.total_marks,
        a.percentage,
        a.started_at,
        a.completed_at

    ORDER BY a.attempt_number DESC
    LIMIT 1`,
    [studentId, quizId]
);

        const attempt = attempts[0] || null;

        return res.status(200).json({
            success: true,
            hasAttempt: !!attempt,
            attempt
        });

    } catch (error) {
        console.error("Get theory quiz attempt status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to check quiz attempt status"
        });
    }
};

module.exports = {
    startOrResumeAttempt,
    getTheoryQuizAttemptStatus
};
