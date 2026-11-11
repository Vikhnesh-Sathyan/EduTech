
const db = require("../../../config/db");

// ==========================================
// GET TODAY'S STUDENT DAILY QUIZZES
// ==========================================
const getTodayDailyQuizzes = async (req, res) => {
    try {
        const studentId = req.user.id;

        // ----------------------------------
        // GET STUDENT ACADEMIC YEAR
        // ----------------------------------
        const [profiles] = await db.query(
            `SELECT education_year_id
             FROM student_profiles
             WHERE user_id = ?
             LIMIT 1`,
            [studentId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                message: "Student academic profile not found"
            });
        }

        const educationYearId = profiles[0].education_year_id;

        // ----------------------------------
        // FETCH TODAY'S AVAILABLE QUIZZES
        // ----------------------------------
        const [quizzes] = await db.query(
            `SELECT
                dq.id,
                dq.subject_id,

                s.name AS subject_name,

                dq.title,
                dq.instructions,

                dq.quiz_date,
                dq.publish_time,

                dq.scheduled_at,
                dq.expires_at,

                (
                    SELECT COUNT(*)
                    FROM daily_quiz_questions q
                    WHERE q.daily_quiz_id = dq.id
                ) AS total_questions,

                CASE
                    WHEN a.id IS NOT NULL THEN 1
                    ELSE 0
                END AS already_attempted,

                a.score,
                a.correct_answers,
                a.submitted_at

             FROM daily_quizzes dq

             INNER JOIN subjects s
                ON dq.subject_id = s.id

             INNER JOIN daily_quiz_attempts a
                ON a.daily_quiz_id = dq.id
                AND a.student_id = ?

             WHERE 1 = 0`,
            [studentId]
        );

        // ----------------------------------
        // FETCH QUIZZES INCLUDING UNATTEMPTED
        // ----------------------------------
        const [availableQuizzes] = await db.query(
            `SELECT
                dq.id,
                dq.subject_id,

                s.name AS subject_name,

                dq.title,
                dq.instructions,

                dq.quiz_date,
                dq.publish_time,

                dq.scheduled_at,
                dq.expires_at,

                (
                    SELECT COUNT(*)
                    FROM daily_quiz_questions q
                    WHERE q.daily_quiz_id = dq.id
                ) AS total_questions,

                CASE
                    WHEN a.id IS NOT NULL THEN TRUE
                    ELSE FALSE
                END AS already_attempted,

                a.score,
                a.correct_answers,
                a.submitted_at

             FROM daily_quizzes dq

             INNER JOIN subjects s
                ON dq.subject_id = s.id

             LEFT JOIN daily_quiz_attempts a
                ON a.daily_quiz_id = dq.id
                AND a.student_id = ?

             WHERE
                s.education_year_id = ?
                AND dq.status = 'published'
                AND dq.quiz_date = DATE(
                    UTC_TIMESTAMP() + INTERVAL 330 MINUTE
                )
                AND dq.scheduled_at <= UTC_TIMESTAMP()
                AND dq.expires_at > UTC_TIMESTAMP()

             ORDER BY
                dq.publish_time ASC,
                dq.id ASC`,
            [studentId, educationYearId]
        );

        return res.status(200).json({
            message: "Today's daily quizzes fetched successfully",
            total: availableQuizzes.length,
            quizzes: availableQuizzes
        });

    } catch (error) {
        console.error("Get student daily quizzes error:", error);

        return res.status(500).json({
            message: "Failed to fetch daily quizzes"
        });
    }
};


// ==========================================
// GET DAILY QUIZ QUESTIONS FOR STUDENT
// ==========================================
const getDailyQuizQuestions = async (req, res) => {
    try {
        const studentId = req.user.id;
        const quizId = Number(req.params.quizId);

        // ----------------------------------
        // VALIDATE QUIZ ID
        // ----------------------------------
        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID"
            });
        }

        // ----------------------------------
        // GET STUDENT ACADEMIC YEAR
        // ----------------------------------
        const [profiles] = await db.query(
            `SELECT education_year_id
             FROM student_profiles
             WHERE user_id = ?
             LIMIT 1`,
            [studentId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        const educationYearId = profiles[0].education_year_id;

        // ----------------------------------
        // CHECK QUIZ ACCESS AND AVAILABILITY
        // ----------------------------------
        const [quizzes] = await db.query(
            `SELECT
                dq.id,
                dq.title,
                dq.instructions,
                dq.quiz_date,
                dq.publish_time,
                s.name AS subject_name
             FROM daily_quizzes dq
             INNER JOIN subjects s
                ON s.id = dq.subject_id
             INNER JOIN education_years ey
                ON ey.id = s.education_year_id
             WHERE dq.id = ?
                AND ey.id = ?
                AND s.status = 'active'
                AND dq.status = 'published'
                AND dq.quiz_date = DATE(
                    UTC_TIMESTAMP() + INTERVAL 330 MINUTE
                )
                AND dq.scheduled_at <= UTC_TIMESTAMP()
                AND dq.expires_at > UTC_TIMESTAMP()
             LIMIT 1`,
            [quizId, educationYearId]
        );

        if (quizzes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Daily quiz not found or no longer available"
            });
        }

        // ----------------------------------
        // CHECK WHETHER STUDENT ALREADY
        // SUBMITTED THIS QUIZ
        // ----------------------------------
        const [attempts] = await db.query(
            `SELECT id, score, correct_answers, submitted_at
             FROM daily_quiz_attempts
             WHERE daily_quiz_id = ?
                AND student_id = ?
             LIMIT 1`,
            [quizId, studentId]
        );

        if (attempts.length > 0) {
            return res.status(409).json({
                success: false,
                already_attempted: true,
                message: "You have already completed this quiz",
                attempt: attempts[0]
            });
        }

        // ----------------------------------
        // FETCH QUESTIONS AND OPTIONS
        // IMPORTANT:
        // Do not select is_correct or explanation.
        // ----------------------------------
        const [rows] = await db.query(
            `SELECT
                q.id AS question_id,
                q.question_text,
                q.question_order,
                o.id AS option_id,
                o.option_text,
                o.option_order
             FROM daily_quiz_questions q
             INNER JOIN daily_quiz_options o
                ON o.question_id = q.id
             WHERE q.daily_quiz_id = ?
             ORDER BY
                q.question_order ASC,
                o.option_order ASC`,
            [quizId]
        );

        // ----------------------------------
        // GROUP OPTIONS UNDER QUESTIONS
        // ----------------------------------
        const questionMap = new Map();

        for (const row of rows) {
            if (!questionMap.has(row.question_id)) {
                questionMap.set(row.question_id, {
                    id: row.question_id,
                    question_text: row.question_text,
                    question_order: row.question_order,
                    options: []
                });
            }

            questionMap.get(row.question_id).options.push({
                id: row.option_id,
                option_text: row.option_text,
                option_order: row.option_order
            });
        }

        const questions = Array.from(questionMap.values());

        return res.status(200).json({
            success: true,
            message: "Daily quiz questions fetched successfully",
            quiz: quizzes[0],
            total_questions: questions.length,
            questions
        });

    } catch (error) {
        console.error("Get daily quiz questions error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch daily quiz questions"
        });
    }
};


// ==========================================
// SUBMIT DAILY QUIZ
// ==========================================
const submitDailyQuiz = async (req, res) => {
    let connection;

    try {
        const studentId = req.user.id;
        const quizId = Number(req.params.quizId);
        const { answers } = req.body;

        // ----------------------------------
        // VALIDATE INPUT
        // ----------------------------------
        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID"
            });
        }

        if (!Array.isArray(answers) || answers.length !== 3) {
            return res.status(400).json({
                success: false,
                message: "Exactly 3 answers are required"
            });
        }

        const questionIds = new Set();

        for (const answer of answers) {
            const questionId = Number(answer.question_id);

            if (!Number.isInteger(questionId) || questionId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid question ID"
                });
            }

            if (questionIds.has(questionId)) {
                return res.status(400).json({
                    success: false,
                    message: "Duplicate question IDs are not allowed"
                });
            }

            questionIds.add(questionId);

            if (answer.selected_option_id !== null) {
                const optionId = Number(answer.selected_option_id);

                if (!Number.isInteger(optionId) || optionId <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid selected option ID"
                    });
                }
            }
        }

        // ----------------------------------
        // START TRANSACTION
        // ----------------------------------
        connection = await db.getConnection();
        await connection.beginTransaction();

        // ----------------------------------
        // GET STUDENT ACADEMIC YEAR
        // ----------------------------------
        const [profiles] = await connection.query(
            `SELECT education_year_id
             FROM student_profiles
             WHERE user_id = ?
             LIMIT 1`,
            [studentId]
        );

        if (profiles.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        const educationYearId = profiles[0].education_year_id;

        // ----------------------------------
        // LOCK AND VALIDATE QUIZ
        // ----------------------------------
        const [quizzes] = await connection.query(
            `SELECT dq.id
             FROM daily_quizzes dq
             INNER JOIN subjects s
                ON s.id = dq.subject_id
             INNER JOIN education_years ey
                ON ey.id = s.education_year_id
             WHERE dq.id = ?
                AND ey.id = ?
                AND s.status = 'active'
                AND dq.status = 'published'
                AND dq.quiz_date = DATE(
                    UTC_TIMESTAMP() + INTERVAL 330 MINUTE
                )
                AND dq.scheduled_at <= UTC_TIMESTAMP()
                AND dq.expires_at > UTC_TIMESTAMP()
             LIMIT 1
             FOR UPDATE`,
            [quizId, educationYearId]
        );

        if (quizzes.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Daily quiz not found or no longer available"
            });
        }

        // ----------------------------------
        // CHECK EXISTING ATTEMPT
        // ----------------------------------
        const [existingAttempts] = await connection.query(
            `SELECT id, score, correct_answers, wrong_answers, submitted_at
             FROM daily_quiz_attempts
             WHERE daily_quiz_id = ?
                AND student_id = ?
             LIMIT 1`,
            [quizId, studentId]
        );

        if (existingAttempts.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                already_attempted: true,
                message: "You have already submitted this quiz",
                attempt: existingAttempts[0]
            });
        }

        // ----------------------------------
        // FETCH QUESTIONS AND CORRECT OPTIONS
        // ----------------------------------
        const [questionRows] = await connection.query(
            `SELECT
                q.id AS question_id,
                q.question_text,
                q.explanation,
                o.id AS option_id,
                o.option_text,
                o.is_correct
             FROM daily_quiz_questions q
             INNER JOIN daily_quiz_options o
                ON o.question_id = q.id
             WHERE q.daily_quiz_id = ?
             ORDER BY q.question_order ASC, o.option_order ASC`,
            [quizId]
        );

        const questionMap = new Map();

        for (const row of questionRows) {
            if (!questionMap.has(row.question_id)) {
                questionMap.set(row.question_id, {
                    question_id: row.question_id,
                    question_text: row.question_text,
                    explanation: row.explanation,
                    options: []
                });
            }

            questionMap.get(row.question_id).options.push({
                id: row.option_id,
                option_text: row.option_text,
                is_correct: Number(row.is_correct) === 1
            });
        }

        const questions = Array.from(questionMap.values());

        if (questions.length !== 3) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "This quiz does not contain the required questions"
            });
        }

        // ----------------------------------
        // VALIDATE QUESTION AND OPTION OWNERSHIP
        // ----------------------------------
        const answerMap = new Map(
            answers.map(answer => [
                Number(answer.question_id),
                answer.selected_option_id === null
                    ? null
                    : Number(answer.selected_option_id)
            ])
        );

        let correctAnswers = 0;
        let wrongAnswers = 0;

        for (const question of questions) {
            if (!answerMap.has(question.question_id)) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "All quiz questions must be submitted"
                });
            }

            const selectedOptionId = answerMap.get(question.question_id);

            if (selectedOptionId === null) {
                continue;
            }

            const selectedOption = question.options.find(
                option => option.id === selectedOptionId
            );

            if (!selectedOption) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Selected option does not belong to its question"
                });
            }

            if (selectedOption.is_correct) {
                correctAnswers++;
            } else {
                wrongAnswers++;
            }
        }

        // ----------------------------------
        // CALCULATE SCORE ON BACKEND
        // ----------------------------------
        const score = correctAnswers;

        // ----------------------------------
        // CREATE ATTEMPT
        // ----------------------------------
        const [attemptResult] = await connection.query(
            `INSERT INTO daily_quiz_attempts (
                daily_quiz_id,
                student_id,
                total_questions,
                correct_answers,
                wrong_answers,
                score,
                submitted_at
            ) VALUES (?, ?, 3, ?, ?, ?, UTC_TIMESTAMP())`,
            [
                quizId,
                studentId,
                correctAnswers,
                wrongAnswers,
                score
            ]
        );

        const attemptId = attemptResult.insertId;

        // ----------------------------------
        // SAVE ALL THREE ANSWERS
        // ----------------------------------
        for (const question of questions) {
            const selectedOptionId = answerMap.get(question.question_id);

            const selectedOption = question.options.find(
                option => option.id === selectedOptionId
            );

            const isCorrect = selectedOption?.is_correct ? 1 : 0;

            await connection.query(
                `INSERT INTO daily_quiz_attempt_answers (
                    attempt_id,
                    question_id,
                    selected_option_id,
                    is_correct
                ) VALUES (?, ?, ?, ?)`,
                [
                    attemptId,
                    question.question_id,
                    selectedOptionId,
                    isCorrect
                ]
            );
        }

        // ----------------------------------
        // FETCH ANSWER REVIEW
        // ----------------------------------
        const [reviewRows] = await connection.query(
            `SELECT
                q.id AS question_id,
                q.question_text,
                q.explanation,
                aa.selected_option_id,
                selected.option_text AS selected_option_text,
                correct.id AS correct_option_id,
                correct.option_text AS correct_option_text,
                aa.is_correct
             FROM daily_quiz_attempt_answers aa
             INNER JOIN daily_quiz_questions q
                ON q.id = aa.question_id
             LEFT JOIN daily_quiz_options selected
                ON selected.id = aa.selected_option_id
             LEFT JOIN daily_quiz_options correct
                ON correct.question_id = q.id
                AND correct.is_correct = 1
             WHERE aa.attempt_id = ?
             ORDER BY q.question_order ASC`,
            [attemptId]
        );

        // ----------------------------------
        // COMMIT TRANSACTION
        // ----------------------------------
        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Daily quiz submitted successfully",
            result: {
                attempt_id: attemptId,
                total_questions: 3,
                correct_answers: correctAnswers,
                wrong_answers: wrongAnswers,
                score,
                submitted_at: new Date().toISOString(),
                answers: reviewRows
            }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Submit daily quiz error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit daily quiz"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


// ==========================================
// EXPORT CONTROLLER
// ==========================================
module.exports = {
    getTodayDailyQuizzes,
    getDailyQuizQuestions,
    submitDailyQuiz
};
