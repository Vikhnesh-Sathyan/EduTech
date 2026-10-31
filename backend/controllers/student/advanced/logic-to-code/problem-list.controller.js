// =====================================================
// IMPORT DATABASE
// =====================================================

const db = require("../../../../config/db");

// =====================================================
// GET PUBLISHED PROBLEMS
// =====================================================

const getPublishedProblems = async (req, res) => {

    try {

        // -------------------------------------------------
        // GET QUERY PARAMETERS
        // -------------------------------------------------

        const {
            search = "",
            difficulty = "",
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
        // VALIDATE DIFFICULTY
        // -------------------------------------------------

        const allowedDifficulties = [
            "easy",
            "medium",
            "hard"
        ];

        if (
            difficulty &&
            !allowedDifficulties.includes(difficulty)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid difficulty"
            });
        }


        // -------------------------------------------------
        // BUILD FILTER CONDITIONS
        // -------------------------------------------------

        let conditions = [
            "p.status = 'published'"
        ];

        let params = [];

        if (search.trim()) {

            conditions.push("p.title LIKE ?");

            params.push(`%${search.trim()}%`);
        }

        if (difficulty) {

            conditions.push("p.difficulty = ?");

            params.push(difficulty);
        }

        const whereClause = conditions.join(" AND ");


        // -------------------------------------------------
        // GET TOTAL PROBLEM COUNT
        // -------------------------------------------------

        const [countResult] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM logic_to_code_problems p
            WHERE ${whereClause}
            `,
            params
        );

        const totalProblems = countResult[0].total;


        // -------------------------------------------------
        // CALCULATE PAGINATION
        // -------------------------------------------------

        const offset = (currentPage - 1) * pageLimit;


        // -------------------------------------------------
        // FETCH PUBLISHED PROBLEMS
        // -------------------------------------------------

        const [problems] = await db.query(
            `
            SELECT
                p.id,
                p.title,
                p.description,
                p.difficulty,
                p.created_at,
                u.name AS mentor_name

            FROM logic_to_code_problems p

            JOIN users u
                ON p.mentor_id = u.id

            WHERE ${whereClause}

            ORDER BY p.created_at DESC

            LIMIT ? OFFSET ?
            `,
            [...params, pageLimit, offset]
        );


        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message: "Published problems fetched successfully",

            data: problems,

            pagination: {
                currentPage,
                limit: pageLimit,
                totalProblems,
                totalPages: Math.ceil(
                    totalProblems / pageLimit
                )
            }

        });

    } catch (error) {

        console.error(
            "Get Published Problems Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch problems"
        });

    }

};


// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {
    getPublishedProblems
};
