
const db = require("../../../../config/db");

// ==========================================
// UPDATE REFERENCE SOLUTION
// ==========================================

const updateProblemSolution = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);
        const solutionId = Number(req.params.solutionId);

        const {
            language,
            solution_code,
            solution_explanation
        } = req.body;

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

        const allowedLanguages = [
            "python",
            "javascript",
            "java"
        ];

        if (!allowedLanguages.includes(language)) {
            return res.status(400).json({
                success: false,
                message: "Invalid programming language."
            });
        }

        if (
            typeof solution_code !== "string" ||
            !solution_code.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Solution code is required."
            });
        }

        if (
            solution_explanation !== undefined &&
            typeof solution_explanation !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid solution explanation."
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
            `UPDATE logic_to_code_solutions
             SET language = ?,
                 solution_code = ?,
                 solution_explanation = ?
             WHERE id = ? AND problem_id = ?`,
            [
                language,
                solution_code,
                solution_explanation?.trim() || null,
                solutionId,
                problemId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Reference solution not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Reference solution updated successfully."
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "A solution for this language already exists."
            });
        }

        console.error("Update Problem Solution Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

module.exports = {
    updateProblemSolution
};
