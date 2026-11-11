
const db = require("../../../config/db");

// ==========================================
// GET STUDENT DAILY QUIZ RESULT
// ==========================================
const getDailyQuizResult = async (req, res) => {
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
        // FETCH STUDENT'S OWN ATTEMPT
        // ----------------------------------
        const [attempts] = await db.query(
            `SELECT
                a.id AS attempt_id,
                a.daily_quiz_id,
                a.total_questions,
                a.correct_answers,
                a.wrong_answers,
                a.score,
                a.submitted_at,
                q.title AS quiz_title,
                q.quiz_date,
                s.name AS subject_name
             FROM daily_quiz_attempts a
             INNER JOIN daily_quizzes q
                ON q.id = a.daily_quiz_id
             INNER JOIN subjects s
                ON s.id = q.subject_id
             WHERE a.daily_quiz_id = ?
                AND a.student_id = ?
             LIMIT 1`,
            [quizId, studentId]
        );

        if (attempts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No submitted result found for this quiz"
            });
        }

        const attempt = attempts[0];

        // ----------------------------------
        // FETCH ANSWER REVIEW
        // ----------------------------------
        const [answers] = await db.query(
            `SELECT
                q.id AS question_id,
                q.question_text,
                q.explanation,
                q.question_order,
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
            [attempt.attempt_id]
        );

        // ----------------------------------
        // RETURN RESULT
        // ----------------------------------
        return res.status(200).json({
            success: true,
            message: "Daily quiz result fetched successfully",
            result: {
                attempt_id: attempt.attempt_id,
                quiz_id: attempt.daily_quiz_id,
                quiz_title: attempt.quiz_title,
                subject_name: attempt.subject_name,
                quiz_date: attempt.quiz_date,
                total_questions: attempt.total_questions,
                correct_answers: attempt.correct_answers,
                wrong_answers: attempt.wrong_answers,
                score: attempt.score,
                submitted_at: attempt.submitted_at,
                answers: answers.map(answer => ({
                    question_id: answer.question_id,
                    question_text: answer.question_text,
                    question_order: answer.question_order,
                    selected_option_id: answer.selected_option_id,
                    selected_option_text: answer.selected_option_text,
                    correct_option_id: answer.correct_option_id,
                    correct_option_text: answer.correct_option_text,
                    is_correct: Number(answer.is_correct) === 1,
                    is_unanswered: answer.selected_option_id === null,
                    explanation: answer.explanation
                }))
            }
        });

    } catch (error) {
        console.error("Get daily quiz result error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch daily quiz result"
        });
    }
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
    getDailyQuizResult
};
