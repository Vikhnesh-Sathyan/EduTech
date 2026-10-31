
const db = require("../../../../config/db");

// ==========================================
// GET STUDENT PROBLEM MISTAKES
// ==========================================

const getStudentProblemMistakes = async (req, res) => {
    try {
        const problemId = Number(req.params.problemId);

        // Validate problem ID
        if (
            !Number.isSafeInteger(problemId) ||
            problemId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
            });
        }

        // Check published problem
        const [problems] = await db.query(
            `SELECT id
             FROM logic_to_code_problems
             WHERE id = ?
             AND status = 'published'`,
            [problemId]
        );

        if (problems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Published problem not found."
            });
        }

        // Fetch common mistakes
        const [mistakes] = await db.query(
            `SELECT
                id,
                mistake_title,
                mistake_description,
                created_at
             FROM logic_to_code_mistakes
             WHERE problem_id = ?
             ORDER BY id ASC`,
            [problemId]
        );

        return res.status(200).json({
            success: true,
            message: "Common mistakes fetched successfully.",
            totalMistakes: mistakes.length,
            mistakes
        });

    } catch (error) {
        console.error(
            "Get Student Problem Mistakes Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch common mistakes."
        });
    }
};

module.exports = {
    getStudentProblemMistakes
};
