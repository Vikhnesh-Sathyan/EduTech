
const db = require("../../../../config/db");

// ==========================================
// DELETE REFERENCE SOLUTION
// ==========================================

const deleteProblemSolution = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);
        const solutionId = Number(req.params.solutionId);

        if (
            !Number.isInteger(problemId) ||
            problemId <= 0 ||
            !Number.isInteger(solutionId) ||
            solutionId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem or solution ID."
            });
        }

        const [problems] = await db.query(
            `SELECT id
             FROM logic_to_code_problems
             WHERE id = ? AND mentor_id = ?`,
            [problemId, mentorId]
        );

        if (problems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Problem not found."
            });
        }

        const [result] = await db.query(
            `DELETE FROM logic_to_code_solutions
             WHERE id = ? AND problem_id = ?`,
            [solutionId, problemId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Reference solution not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Reference solution deleted successfully."
        });

    } catch (error) {
        console.error("Delete Problem Solution Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

module.exports = {
    deleteProblemSolution
};
