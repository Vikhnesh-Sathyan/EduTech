
// =====================================================
// IMPORT DATABASE
// =====================================================

const db = require("../../../../config/db");


// =====================================================
// GET STUDENT SUBMISSION HISTORY
// =====================================================

const getStudentSubmissionHistory = async (req, res) => {

    try {

        const studentId = req.user.id;

        const {
            problemId = "",
            status = "",
            page = 1,
            limit = 10
        } = req.query;


        // -------------------------------------------------
        // VALIDATE PAGINATION
        // -------------------------------------------------

        const currentPage = Number(page);
        const pageLimit = Number(limit);

        if (
            !Number.isInteger(currentPage) ||
            currentPage < 1 ||
            !Number.isInteger(pageLimit) ||
            pageLimit < 1 ||
            pageLimit > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination values"
            });
        }


        // -------------------------------------------------
        // VALIDATE PROBLEM ID
        // -------------------------------------------------

        let parsedProblemId = null;

        if (problemId !== "") {

            parsedProblemId = Number(problemId);

            if (
                !Number.isInteger(parsedProblemId) ||
                parsedProblemId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid problem ID"
                });
            }

        }


        // -------------------------------------------------
        // VALIDATE EXECUTION STATUS
        // -------------------------------------------------

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

        if (
            status &&
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid submission status"
            });
        }


        // -------------------------------------------------
        // BUILD FILTER CONDITIONS
        // -------------------------------------------------

        let conditions = [
            "s.student_id = ?"
        ];

        let params = [studentId];

        if (parsedProblemId !== null) {

            conditions.push("s.problem_id = ?");

            params.push(parsedProblemId);

        }

        if (status) {

            conditions.push("s.execution_status = ?");

            params.push(status);

        }

        const whereClause = conditions.join(" AND ");


        // -------------------------------------------------
        // GET TOTAL SUBMISSION COUNT
        // -------------------------------------------------

        const [countResult] = await db.query(
            `
            SELECT COUNT(*) AS total

            FROM logic_to_code_submissions s

            WHERE ${whereClause}
            `,
            params
        );

        const totalSubmissions = countResult[0].total;


        // -------------------------------------------------
        // CALCULATE PAGINATION
        // -------------------------------------------------

        const offset = (currentPage - 1) * pageLimit;


        // -------------------------------------------------
        // FETCH SUBMISSION HISTORY
        // -------------------------------------------------

        const [submissions] = await db.query(
            `
            SELECT
                s.id,
                s.problem_id,
                p.title AS problem_title,
                p.difficulty,

                s.language,
                s.submission_number,
                s.execution_status,

                s.passed_test_cases,
                s.total_test_cases,

                s.execution_time_ms,
                s.memory_used_kb,

                s.error_message,
                s.mentor_feedback,
                s.review_status,

                s.submitted_at,
                s.reviewed_at

            FROM logic_to_code_submissions s

            JOIN logic_to_code_problems p
                ON s.problem_id = p.id

            WHERE ${whereClause}

            ORDER BY s.submitted_at DESC, s.id DESC

            LIMIT ? OFFSET ?
            `,
            [...params, pageLimit, offset]
        );


        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message: "Submission history fetched successfully",

            data: submissions,

            pagination: {
                currentPage,
                limit: pageLimit,
                totalSubmissions,
                totalPages: Math.ceil(
                    totalSubmissions / pageLimit
                )
            }

        });

    } catch (error) {

        console.error(
            "Get Student Submission History Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch submission history"
        });

    }

};


// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {
    getStudentSubmissionHistory
};
