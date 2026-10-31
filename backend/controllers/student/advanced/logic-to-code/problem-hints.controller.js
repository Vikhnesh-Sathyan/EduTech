
const db = require("../../../../config/db");

// ==========================================
// GET STUDENT PROBLEM HINTS
// ==========================================

const getStudentProblemHints = async (req, res) => {
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

        // Check whether problem is published
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

        // Fetch hints
        const [hints] = await db.query(
            `SELECT
                id,
                hint_number,
                hint_content
             FROM logic_to_code_hints
             WHERE problem_id = ?
             ORDER BY hint_number ASC`,
            [problemId]
        );

        return res.status(200).json({
            success: true,
            message: "Problem hints fetched successfully.",
            totalHints: hints.length,
            hints
        });

    } catch (error) {
        console.error(
            "Get Student Problem Hints Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch problem hints."
        });
    }
};

module.exports = {
    getStudentProblemHints
};
