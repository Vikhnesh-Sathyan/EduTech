
const db = require("../../../config/db");

// =====================================================
// GET STUDENT DAILY QUIZ DASHBOARD
// =====================================================

const getDailyQuizDashboard = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Get current India date and time.
        const parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23"
        }).formatToParts(new Date());

        const values = {};

        parts.forEach((part) => {
            values[part.type] = part.value;
        });

        const indiaDate =
            `${values.year}-${values.month}-${values.day}`;

        const indiaDateTime =
            `${indiaDate} ${values.hour}:${values.minute}:${values.second}`;

        // Find today's quiz only if the student is enrolled.
        const [quizzes] = await db.execute(
            `SELECT
                dq.id,
                dq.title,
                dq.instructions,
                dq.quiz_date,
                dq.publish_time,
                dq.scheduled_at,
                dq.expires_at,
                s.id AS subject_id,
                s.name AS subject_name,
                dqa.id AS attempt_id,
                dqa.submitted_at

            FROM daily_quizzes dq

            INNER JOIN subjects s
                ON s.id = dq.subject_id

            INNER JOIN student_subjects ss
                ON ss.subject_id = dq.subject_id
                AND ss.student_id = ?

            LEFT JOIN daily_quiz_attempts dqa
                ON dqa.daily_quiz_id = dq.id
                AND dqa.student_id = ?

            WHERE dq.quiz_date = ?
                AND dq.status = 'published'
                AND dq.scheduled_at <= ?
                AND dq.expires_at > ?

            LIMIT 1`,
            [
                studentId,
                studentId,
                indiaDate,
                indiaDateTime,
                indiaDateTime
            ]
        );

        // No active quiz available.
        if (quizzes.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No Daily Quiz is currently available.",
                quiz: null
            });
        }

        const quiz = quizzes[0];

        const hasAttempted = Boolean(quiz.attempt_id);

        return res.status(200).json({
            success: true,
            quiz: {
                id: quiz.id,
                title: quiz.title,
                instructions: quiz.instructions,
                quiz_date: quiz.quiz_date,
                publish_time: quiz.publish_time,
                expires_at: quiz.expires_at,
                subject_id: quiz.subject_id,
                subject_name: quiz.subject_name,
                status: hasAttempted ? "completed" : "available",
                has_attempted: hasAttempted,
                submitted_at: quiz.submitted_at
            }
        });

    } catch (error) {
        console.error("Get Daily Quiz Dashboard Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load Daily Quiz dashboard."
        });
    }
};

module.exports = {
    getDailyQuizDashboard
};
