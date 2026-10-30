const db = require("../../../../config/db");

// =====================================================
// GET ALL STUDENT SUBMISSIONS FOR MENTOR
// =====================================================

const getMentorSubmissions = async (req, res) => {
    try {
        const mentorId = req.user.id;

        const {
            status,
            language,
            search,
            page = 1,
            limit = 10
        } = req.query;

        // ---------------------------------------------
        // VALIDATE PAGINATION
        // ---------------------------------------------

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        if (
            !Number.isInteger(parsedPage) ||
            parsedPage < 1 ||
            !Number.isInteger(parsedLimit) ||
            parsedLimit < 1 ||
            parsedLimit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination values"
            });
        }

        // ---------------------------------------------
        // VALIDATE FILTERS
        // ---------------------------------------------

        const allowedStatuses = [
            "pending",
            "running",
            "accepted",
            "wrong_answer",
            "compilation_error",
            "runtime_error",
            "time_limit_exceeded",
            "memory_limit_exceeded",
            "internal_error"
        ];

        const allowedLanguages = [
            "python",
            "javascript",
            "java"
        ];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid execution status"
            });
        }

        if (language && !allowedLanguages.includes(language)) {
            return res.status(400).json({
                success: false,
                message: "Invalid programming language"
            });
        }

        // ---------------------------------------------
        // BUILD FILTER CONDITIONS
        // ---------------------------------------------

        let conditions = ["p.mentor_id = ?"];
        let values = [mentorId];

        if (status) {
            conditions.push("s.execution_status = ?");
            values.push(status);
        }

        if (language) {
            conditions.push("s.language = ?");
            values.push(language);
        }

        if (search && search.trim()) {
            conditions.push(
                "(p.title LIKE ? OR u.name LIKE ?)"
            );

            const searchValue = `%${search.trim()}%`;

            values.push(searchValue, searchValue);
        }

        const whereClause = conditions.join(" AND ");

        // ---------------------------------------------
        // GET TOTAL SUBMISSION COUNT
        // ---------------------------------------------

        const [countResult] = await db.query(
            `SELECT COUNT(*) AS totalSubmissions
             FROM logic_to_code_submissions s
             JOIN logic_to_code_problems p
                ON p.id = s.problem_id
             JOIN users u
                ON u.id = s.student_id
             WHERE ${whereClause}`,
            values
        );

        const totalSubmissions = countResult[0].totalSubmissions;

        const offset = (parsedPage - 1) * parsedLimit;

        // ---------------------------------------------
        // GET SUBMISSIONS
        // ---------------------------------------------

        const [submissions] = await db.query(
            `SELECT
                s.id,
                s.problem_id,
                p.title AS problem_title,
                u.id AS student_id,
                u.name AS student_name,
                s.language,
                s.execution_status,
                s.passed_test_cases,
                s.total_test_cases,
                s.execution_time_ms,
                s.submitted_at,
                s.review_status,
                s.mentor_feedback
             FROM logic_to_code_submissions s
             JOIN logic_to_code_problems p
                ON p.id = s.problem_id
             JOIN users u
                ON u.id = s.student_id
             WHERE ${whereClause}
             ORDER BY s.submitted_at DESC
             LIMIT ? OFFSET ?`,
            [...values, parsedLimit, offset]
        );

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Student submissions loaded successfully",

            pagination: {
                currentPage: parsedPage,
                limit: parsedLimit,
                totalSubmissions,
                totalPages: Math.ceil(
                    totalSubmissions / parsedLimit
                )
            },

            submissions
        });

    } catch (error) {
        console.error("Mentor Submissions Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load student submissions"
        });
    }
};

module.exports = {
    getMentorSubmissions
};