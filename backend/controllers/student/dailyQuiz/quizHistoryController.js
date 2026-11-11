
const db = require("../../../config/db");

// =====================================================
// GET DAILY QUIZ HISTORY
// =====================================================

const getDailyQuizHistory = async (req, res) => {

    try {

        const studentId = req.user.id;

        // -------------------------------------------------
        // GET STUDENT'S ENROLLED QUIZ HISTORY
        // -------------------------------------------------

        const [quizzes] = await db.execute(
            `SELECT
                dq.id AS quiz_id,
                dq.title,
                dq.quiz_date,
                dq.subject_id,
                s.name AS subject_name,

                a.id AS attempt_id,
                a.total_questions,
                a.correct_answers,
                a.wrong_answers,
                a.score,
                a.submitted_at

             FROM daily_quizzes dq

             INNER JOIN student_subjects ss
                ON ss.subject_id = dq.subject_id
                AND ss.student_id = ?

             INNER JOIN subjects s
                ON s.id = dq.subject_id

             LEFT JOIN daily_quiz_attempts a
                ON a.daily_quiz_id = dq.id
                AND a.student_id = ?

             WHERE dq.status = 'published'
             AND dq.scheduled_at <= NOW()

             ORDER BY dq.quiz_date DESC, dq.id DESC`,
            [studentId, studentId]
        );

        // -------------------------------------------------
        // FORMAT HISTORY
        // -------------------------------------------------

        const history = quizzes.map(quiz => {

            const hasAttempt = quiz.attempt_id !== null;

            return {
                quiz_id: quiz.quiz_id,
                title: quiz.title,
                quiz_date: quiz.quiz_date,
                subject_id: quiz.subject_id,
                subject_name: quiz.subject_name,

                status: hasAttempt
                    ? "completed"
                    : "not_attempted",

                has_attempted: hasAttempt,

                attempt_id: quiz.attempt_id,

                total_questions: hasAttempt
                    ? quiz.total_questions
                    : 3,

                correct_answers: quiz.correct_answers ?? 0,
                wrong_answers: quiz.wrong_answers ?? 0,

                unanswered: hasAttempt
                    ? quiz.total_questions -
                      quiz.correct_answers -
                      quiz.wrong_answers
                    : null,

                score: quiz.score,

                submitted_at: quiz.submitted_at,

                can_view_result: hasAttempt
            };
        });

        // -------------------------------------------------
        // RETURN HISTORY
        // -------------------------------------------------

        return res.status(200).json({
            success: true,
            total_quizzes: history.length,
            completed_quizzes: history.filter(
                quiz => quiz.has_attempted
            ).length,
            pending_quizzes: history.filter(
                quiz => !quiz.has_attempted
            ).length,
            history
        });

    } catch (error) {

        console.error("Daily Quiz History Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve daily quiz history."
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getDailyQuizHistory
};
