
const db = require("../../../../config/db");

// ==========================================
// GET STUDENT PROBLEM STEPS
// ==========================================

const getStudentProblemSteps = async (req, res) => {
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

        // Fetch logical steps
        const [steps] = await db.query(
            `SELECT
                id,
                step_number,
                step_description
             FROM logic_to_code_steps
             WHERE problem_id = ?
             ORDER BY step_number ASC`,
            [problemId]
        );

        return res.status(200).json({
            success: true,
            message: "Problem steps fetched successfully.",
            totalSteps: steps.length,
            steps
        });

    } catch (error) {
        console.error(
            "Get Student Problem Steps Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch problem steps."
        });
    }
};

module.exports = {
    getStudentProblemSteps
};
