
const db = require("../../../config/db");

const {
    generateAlgorithmSteps
} = require("../../../services/algorithmGeneratorService");

// Generate algorithm steps from an existing code solution.
const generateAlgorithm = async (req, res) => {
    try {
        // Only students can generate algorithm steps.
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can generate algorithm steps."
            });
        }

        const solutionId = Number(req.params.solutionId);

        if (!Number.isInteger(solutionId) || solutionId <= 0) {
            return res.status(400).json({
                message: "Invalid solution ID."
            });
        }

        // Retrieve the existing code solution.
        const [solutions] = await db.query(
            `SELECT id, student_id, code, programming_language
             FROM student_code_solutions
             WHERE id = ?`,
            [solutionId]
        );

        if (solutions.length === 0) {
            return res.status(404).json({
                message: "Code solution not found."
            });
        }

        const solution = solutions[0];

        // Only the owner can generate algorithm steps.
        if (Number(solution.student_id) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "You can only generate algorithms for your own solutions."
            });
        }

        if (
            typeof solution.code !== "string" ||
            !solution.code.trim()
        ) {
            return res.status(400).json({
                message: "The code solution is empty."
            });
        }

        if (
            typeof solution.programming_language !== "string" ||
            !solution.programming_language.trim()
        ) {
            return res.status(400).json({
                message: "Programming language is missing from the solution."
            });
        }

        // Generate steps using the existing Gemini AI service.
        const steps = await generateAlgorithmSteps(
            solution.code,
            solution.programming_language
        );

        // Return generated steps for the student to review.
        // Saving is handled by the existing algorithm-steps endpoint.
        return res.status(200).json({
            message: "Algorithm steps generated successfully.",
            solution_id: solutionId,
            total_steps: steps.length,
            steps
        });

    } catch (error) {
        console.error("Generate algorithm error:", error);

        return res.status(500).json({
            message: "Failed to generate algorithm steps. Please try again."
        });
    }
};

module.exports = {
    generateAlgorithm
};
