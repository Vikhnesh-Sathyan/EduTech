const db = require("../../../../config/db");

// =====================================================
// GET REPORTED DISCUSSIONS FOR MENTOR
// =====================================================

const getMentorDiscussionReports = async (req, res) => {
    try {
        const mentorId = req.user.id;

        const {
            status,
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
        // VALIDATE STATUS
        // ---------------------------------------------

        const allowedStatuses = [
            "pending",
            "action_taken",
            "dismissed"
        ];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report status"
            });
        }

        // ---------------------------------------------
        // BUILD FILTER CONDITIONS
        // ---------------------------------------------

        let conditions = ["p.mentor_id = ?"];
        let values = [mentorId];

        if (status) {
            conditions.push("r.status = ?");
            values.push(status);
        }

        const whereClause = conditions.join(" AND ");

        // ---------------------------------------------
        // GET TOTAL REPORT COUNT
        // ---------------------------------------------

        const [countResult] = await db.query(
            `SELECT COUNT(*) AS totalReports
             FROM logic_to_code_discussion_reports r
             JOIN logic_to_code_discussions d
                ON d.id = r.discussion_id
             JOIN logic_to_code_problems p
                ON p.id = d.problem_id
             WHERE ${whereClause}`,
            values
        );

        const totalReports = countResult[0].totalReports;

        const offset = (parsedPage - 1) * parsedLimit;

        // ---------------------------------------------
        // GET REPORTED DISCUSSIONS
        // ---------------------------------------------

        const [reports] = await db.query(
            `SELECT
                r.id AS report_id,
                r.discussion_id,
                r.reporter_id,
                reporter.name AS reporter_name,
                r.reason,
                r.description,
                r.status,
                r.reviewed_by,
                reviewer.name AS reviewer_name,
                r.reviewed_at,
                r.created_at AS reported_at,

                d.content AS discussion_content,
                d.user_id AS discussion_author_id,
                author.name AS discussion_author_name,
                author.role AS discussion_author_role,
                d.is_deleted,

                p.id AS problem_id,
                p.title AS problem_title

             FROM logic_to_code_discussion_reports r

             JOIN logic_to_code_discussions d
                ON d.id = r.discussion_id

             JOIN logic_to_code_problems p
                ON p.id = d.problem_id

             JOIN users reporter
                ON reporter.id = r.reporter_id

             JOIN users author
                ON author.id = d.user_id

             LEFT JOIN users reviewer
                ON reviewer.id = r.reviewed_by

             WHERE ${whereClause}

             ORDER BY
                CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END,
                r.created_at DESC

             LIMIT ? OFFSET ?`,
            [...values, parsedLimit, offset]
        );

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Discussion reports loaded successfully",

            pagination: {
                currentPage: parsedPage,
                limit: parsedLimit,
                totalReports,
                totalPages: Math.ceil(
                    totalReports / parsedLimit
                )
            },

            reports
        });

    } catch (error) {
        console.error("Mentor Discussion Reports Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load discussion reports"
        });
    }
};

module.exports = {
    getMentorDiscussionReports
};