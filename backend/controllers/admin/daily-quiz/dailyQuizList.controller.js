
const db = require("../../../config/db");

// ==========================================
// GET ADMIN DAILY QUIZ LIST
// ==========================================
const getDailyQuizList = async (req, res) => {
    try {
        const {
            subject_id,
            quiz_date,
            status
        } = req.query;

        const conditions = [];
        const params = [];

        // ----------------------------------
        // FILTER BY SUBJECT
        // ----------------------------------
        if (subject_id !== undefined) {
            if (
                !/^\d+$/.test(subject_id) ||
                Number(subject_id) <= 0
            ) {
                return res.status(400).json({
                    message: "Invalid subject ID"
                });
            }

            conditions.push("dq.subject_id = ?");
            params.push(Number(subject_id));
        }

        // ----------------------------------
        // FILTER BY QUIZ DATE
        // ----------------------------------
        if (quiz_date !== undefined) {
            if (
                typeof quiz_date !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(quiz_date)
            ) {
                return res.status(400).json({
                    message: "Quiz date must use YYYY-MM-DD format"
                });
            }

            const [year, month, day] = quiz_date.split("-").map(Number);

            const dateCheck = new Date(
                Date.UTC(year, month - 1, day)
            );

            if (
                dateCheck.getUTCFullYear() !== year ||
                dateCheck.getUTCMonth() !== month - 1 ||
                dateCheck.getUTCDate() !== day
            ) {
                return res.status(400).json({
                    message: "Invalid quiz date"
                });
            }

            conditions.push("dq.quiz_date = ?");
            params.push(quiz_date);
        }

        // ----------------------------------
        // FILTER BY STATUS
        // ----------------------------------
        if (status !== undefined) {
            const allowedStatuses = [
                "draft",
                "published",
                "archived"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid quiz status"
                });
            }

            conditions.push("dq.status = ?");
            params.push(status);
        }

        // ----------------------------------
        // BUILD FILTER QUERY
        // ----------------------------------
        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        // ----------------------------------
        // FETCH QUIZZES
        // ----------------------------------
        const [quizzes] = await db.query(
            `SELECT
                dq.id,
                dq.subject_id,

                dq.created_by,

                s.name AS subject_name,

                ep.id AS program_id,
                ep.name AS program_name,

                d.id AS department_id,
                d.name AS department_name,

                ey.id AS year_id,
                ey.name AS year_name,

                dq.title,
                dq.instructions,

                dq.quiz_date,
                dq.publish_time,

                dq.scheduled_at,
                dq.expires_at,

                dq.status,

                dq.created_at,
                dq.updated_at,

                (
                    SELECT COUNT(*)
                    FROM daily_quiz_questions q
                    WHERE q.daily_quiz_id = dq.id
                ) AS total_questions,

                (
                    SELECT COUNT(*)
                    FROM daily_quiz_attempts a
                    WHERE a.daily_quiz_id = dq.id
                ) AS total_attempts

             FROM daily_quizzes dq

             INNER JOIN subjects s
                ON dq.subject_id = s.id

             INNER JOIN education_years ey
                ON s.education_year_id = ey.id

             INNER JOIN departments d
                ON ey.department_id = d.id

             INNER JOIN education_programs ep
                ON d.education_program_id = ep.id

             ${whereClause}

             ORDER BY
                dq.quiz_date DESC,
                dq.id DESC`,
            params
        );

        return res.status(200).json({
            message: "Daily quizzes fetched successfully",
            total: quizzes.length,
            quizzes
        });

    } catch (error) {
        console.error("Get daily quiz list error:", error);

        return res.status(500).json({
            message: "Failed to fetch daily quizzes"
        });
    }
};


// ==========================================
// EXPORT CONTROLLER
// ==========================================
module.exports = {
    getDailyQuizList
};
