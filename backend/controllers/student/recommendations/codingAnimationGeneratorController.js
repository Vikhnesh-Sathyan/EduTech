
const db = require("../../../config/db");

const {
    generateCodeAnimationSteps
} = require("../../../services/codeAnimationGeneratorService");

// ==========================================
// GENERATE CODE ANIMATION STEPS
// ==========================================
const generateCodeAnimation = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can generate code animations."
            });
        }

        const solutionId = Number(req.params.solutionId);

        if (!Number.isInteger(solutionId) || solutionId <= 0) {
            return res.status(400).json({
                message: "Invalid solution ID."
            });
        }

        const [solutions] = await db.query(
            `SELECT
                s.id,
                s.student_id,
                s.code,
                s.programming_language,
                p.status AS post_status,
                sub.status AS subject_status
             FROM student_code_solutions s
             INNER JOIN student_code_posts p
                ON p.id = s.post_id
             INNER JOIN subjects sub
                ON sub.id = p.subject_id
             WHERE s.id = ?
               AND (
                    p.status = 'published'
                    OR p.student_id = ?
               )
               AND sub.status = 'active'`,
            [solutionId, req.user.id]
        );

        if (solutions.length === 0) {
            return res.status(404).json({
                message: "Code solution not found or access denied."
            });
        }

        const solution = solutions[0];

        if (Number(solution.student_id) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "You can only generate animations for your own solutions."
            });
        }

        const steps = await generateCodeAnimationSteps(
            solution.code,
            solution.programming_language
        );

        return res.status(200).json({
            message: "Code animation steps generated successfully.",
            solution_id: solutionId,
            total_steps: steps.length,
            steps
        });

    } catch (error) {
        console.error("Generate code animation error:", error);

        return res.status(500).json({
            message: "Failed to generate code animation steps."
        });
    }
};

module.exports = {
    generateCodeAnimation
};
