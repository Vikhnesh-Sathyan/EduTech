
const db = require("../../../config/db");

// ==========================================
// GET DAILY QUIZ ADMIN DASHBOARD
// ==========================================
const getDailyQuizDashboard = async (req, res) => {
    try {
        const sql = `
            SELECT
                s.id AS subject_id,
                s.name AS subject_name,

                ey.id AS year_id,
                ey.name AS year_name,

                d.id AS department_id,
                d.name AS department_name,

                ep.id AS program_id,
                ep.name AS program_name,

                COUNT(DISTINCT qb.id) AS total_questions,

                COUNT(
                    DISTINCT CASE
                        WHEN qb.id IS NOT NULL
                         AND qb.status = 'active'
                         AND NOT EXISTS (
                             SELECT 1
                             FROM daily_quiz_questions dqq
                             WHERE dqq.source_question_id = qb.id
                         )
                        THEN qb.id
                    END
                ) AS unused_questions,

                COALESCE(
                    das.publish_time,
                    '08:00:00'
                ) AS publish_time,

                COALESCE(
                    das.low_stock_threshold,
                    9
                ) AS low_stock_threshold,

                COALESCE(
                    das.status,
                    'not_configured'
                ) AS automation_status

            FROM subjects s

            INNER JOIN education_years ey
                ON ey.id = s.education_year_id

            INNER JOIN departments d
                ON d.id = ey.department_id

            INNER JOIN education_programs ep
                ON ep.id = d.education_program_id

            LEFT JOIN question_bank_questions qb
                ON qb.subject_id = s.id

            LEFT JOIN daily_quiz_automation_settings das
                ON das.subject_id = s.id

            WHERE s.status = 'active'

            GROUP BY
                s.id,
                s.name,
                ey.id,
                ey.name,
                d.id,
                d.name,
                ep.id,
                ep.name,
                das.publish_time,
                das.low_stock_threshold,
                das.status

            ORDER BY
                ep.name,
                d.name,
                ey.year_order,
                s.name
        `;

        const [subjects] = await db.execute(sql);

        const dashboardData = subjects.map(subject => {
            const totalQuestions =
                Number(subject.total_questions);

            const unusedQuestions =
                Number(subject.unused_questions);

            const threshold =
                Number(subject.low_stock_threshold);

            return {
                ...subject,

                total_questions: totalQuestions,
                unused_questions: unusedQuestions,

                possible_quizzes:
                    Math.floor(unusedQuestions / 3),

                low_stock:
                    unusedQuestions < threshold
            };
        });

        return res.status(200).json({
            success: true,
            message: "Daily Quiz dashboard fetched successfully",
            data: dashboardData
        });

    } catch (error) {
        console.error(
            "Get Daily Quiz dashboard error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load Daily Quiz dashboard"
        });
    }
};

module.exports = {
    getDailyQuizDashboard
};
