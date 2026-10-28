
const db = require("../../../../config/db");

// =====================================================
// GET ALL PUBLISHED LOGIC TO CODE PROBLEMS
// =====================================================

const getPublishedProblems = async (req, res) => {
    try {
        const [problems] = await db.execute(
            `SELECT
                p.id,
                p.title,
                p.description,
                p.mode,
                p.difficulty,
                p.max_marks,
                p.publish_date,
                p.due_date,
                p.language_id,
                s.name AS language_name,
                p.mentor_id
            FROM code_logic_problems p
            INNER JOIN subjects s
                ON p.language_id = s.id
            WHERE p.status = 'published'
                AND (p.publish_date IS NULL
                    OR p.publish_date <= NOW())
                AND (p.due_date IS NULL
                    OR p.due_date >= NOW())
            ORDER BY p.created_at DESC`
        );

        return res.status(200).json({
            success: true,
            count: problems.length,
            problems
        });

    } catch (error) {
        console.error(
            "Get published Logic to Code problems error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch Logic to Code problems."
        });
    }
};

module.exports = {
    getPublishedProblems
};
