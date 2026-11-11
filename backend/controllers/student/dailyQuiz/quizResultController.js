
const db = require("../../../config/db");

// =====================================================
// GET DAILY QUIZ RESULT
// =====================================================

const getDailyQuizResult = async (req, res) => {

    try {

        const studentId = req.user.id;
        const quizId = Number(req.params.quizId);

        // -------------------------------------------------
        // VALIDATE QUIZ ID
        // -------------------------------------------------

        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID."
            });
        }

        // -------------------------------------------------
        // GET STUDENT ATTEMPT
        // -------------------------------------------------

        const [attempts] = await db.execute(
            `SELECT
                id,
                daily_quiz_id,
                total_questions,
                correct_answers,
                wrong_answers,
                score,
                submitted_at
             FROM daily_quiz_attempts
             WHERE daily_quiz_id = ?
             AND student_id = ?
             LIMIT 1`,
            [quizId, studentId]
        );

        if (attempts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No submitted result found for this quiz."
            });
        }

        const attempt = attempts[0];

        // -------------------------------------------------
        // GET QUIZ DETAILS
        // -------------------------------------------------

        const [quizzes] = await db.execute(
            `SELECT
                dq.id,
                dq.title,
                dq.quiz_date,
                dq.subject_id,
                s.name AS subject_name
             FROM daily_quizzes dq
             INNER JOIN subjects s
                ON s.id = dq.subject_id
             WHERE dq.id = ?`,
            [quizId]
        );

        if (quizzes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found."
            });
        }

        const quiz = quizzes[0];

        // -------------------------------------------------
        // GET ALL QUESTIONS AND OPTIONS
        // -------------------------------------------------

        const [questions] = await db.execute(
            `SELECT
                q.id AS question_id,
                q.question_text,
                q.explanation,
                q.question_order,
                a.selected_option_id,
                a.is_correct
             FROM daily_quiz_questions q
             INNER JOIN daily_quiz_attempt_answers a
                ON a.question_id = q.id
             WHERE q.daily_quiz_id = ?
             AND a.attempt_id = ?
             ORDER BY q.question_order`,
            [quizId, attempt.id]
        );

        // -------------------------------------------------
        // GET OPTIONS
        // -------------------------------------------------

        const [options] = await db.execute(
            `SELECT
                o.id AS option_id,
                o.question_id,
                o.option_text,
                o.is_correct,
                o.option_order
             FROM daily_quiz_options o
             INNER JOIN daily_quiz_questions q
                ON q.id = o.question_id
             WHERE q.daily_quiz_id = ?
             ORDER BY q.question_order, o.option_order`,
            [quizId]
        );

        // -------------------------------------------------
        // BUILD RESULT QUESTIONS
        // -------------------------------------------------

        const reviewedQuestions = questions.map(question => {

            const questionOptions = options.filter(
                option => option.question_id === question.question_id
            );

            const correctOption = questionOptions.find(
                option => Number(option.is_correct) === 1
            );

            const selectedOption = questionOptions.find(
                option => option.option_id === question.selected_option_id
            );

            return {
                question_id: question.question_id,
                question_text: question.question_text,
                question_order: question.question_order,

                selected_option_id: question.selected_option_id,

                selected_answer: selectedOption
                    ? selectedOption.option_text
                    : null,

                correct_option_id: correctOption
                    ? correctOption.option_id
                    : null,

                correct_answer: correctOption
                    ? correctOption.option_text
                    : null,

                is_correct: Boolean(question.is_correct),

                options: questionOptions.map(option => ({
                    id: option.option_id,
                    option_text: option.option_text
                }))
            };
        });

        // -------------------------------------------------
        // RETURN RESULT
        // -------------------------------------------------

        return res.status(200).json({
            success: true,
            result: {
                attempt_id: attempt.id,
                quiz_id: quiz.id,
                quiz_title: quiz.title,
                quiz_date: quiz.quiz_date,
                subject_id: quiz.subject_id,
                subject_name: quiz.subject_name,

                total_questions: attempt.total_questions,
                correct_answers: attempt.correct_answers,
                wrong_answers: attempt.wrong_answers,

                unanswered:
                    attempt.total_questions -
                    attempt.correct_answers -
                    attempt.wrong_answers,

                score: attempt.score,
                submitted_at: attempt.submitted_at,

                questions: reviewedQuestions
            }
        });

    } catch (error) {

        console.error("Get Daily Quiz Result Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve quiz result."
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getDailyQuizResult
};
