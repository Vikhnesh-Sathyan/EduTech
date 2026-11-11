
const db = require("../../../config/db");

// ==========================================
// GET STUDENT DAILY QUIZ HISTORY
// ==========================================
const getDailyQuizHistory = async (req, res) => {
    try {
        const studentId = req.user.id;

        // ----------------------------------
        // PAGINATION
        // ----------------------------------
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = 10;
        const offset = (page - 1) * limit;

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
        // COUNT HISTORY RECORDS
        // ----------------------------------
        const [countRows] = await db.query(
            `SELECT COUNT(*) AS total
             FROM daily_quizzes dq
             INNER JOIN subjects s
                ON s.id = dq.subject_id
             INNER JOIN education_years ey
                ON ey.id = s.education_year_id
             LEFT JOIN daily_quiz_attempts a
                ON a.daily_quiz_id = dq.id
                AND a.student_id = ?
             WHERE ey.id = ?
                AND dq.status IN ('published', 'archived')
                AND dq.quiz_date <= DATE(
                    UTC_TIMESTAMP() + INTERVAL 330 MINUTE
                )
                AND dq.scheduled_at <= UTC_TIMESTAMP()
                AND (
                    dq.expires_at <= UTC_TIMESTAMP()
                    OR a.id IS NOT NULL
                )`,
            [studentId, educationYearId]
        );

        const totalRecords = Number(countRows[0].total);

        // ----------------------------------
        // FETCH HISTORY
        // ----------------------------------
        const [history] = await db.query(
            `SELECT
                dq.id AS quiz_id,
                dq.title,
                dq.quiz_date,
                dq.publish_time,
                s.name AS subject_name,
                a.id AS attempt_id,
                a.score,
                a.total_questions,
                a.correct_answers,
                a.wrong_answers,
                a.submitted_at,
                CASE
                    WHEN a.id IS NOT NULL THEN 'completed'
                    ELSE 'missed'
                END AS quiz_status
             FROM daily_quizzes dq
             INNER JOIN subjects s
                ON s.id = dq.subject_id
             INNER JOIN education_years ey
                ON ey.id = s.education_year_id
             LEFT JOIN daily_quiz_attempts a
                ON a.daily_quiz_id = dq.id
                AND a.student_id = ?
             WHERE ey.id = ?
                AND dq.status IN ('published', 'archived')
                AND dq.quiz_date <= DATE(
                    UTC_TIMESTAMP() + INTERVAL 330 MINUTE
                )
                AND dq.scheduled_at <= UTC_TIMESTAMP()
                AND (
                    dq.expires_at <= UTC_TIMESTAMP()
                    OR a.id IS NOT NULL
                )
             ORDER BY dq.quiz_date DESC, dq.id DESC
             LIMIT ? OFFSET ?`,
            [studentId, educationYearId, limit, offset]
        );

        // ----------------------------------
        // RETURN HISTORY
        // ----------------------------------
        return res.status(200).json({
            success: true,
            message: "Daily quiz history fetched successfully",
            pagination: {
                current_page: page,
                per_page: limit,
                total_records: totalRecords,
                total_pages: Math.ceil(totalRecords / limit)
            },
            history
        });

    } catch (error) {
        console.error("Get daily quiz history error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch daily quiz history"
        });
    }
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
    getDailyQuizHistory
};
