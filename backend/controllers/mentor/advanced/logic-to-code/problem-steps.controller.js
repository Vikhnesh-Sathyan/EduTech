
const db = require("../../../../config/db");

// ==========================================
// ADD LOGIC STEPS TO A PROBLEM
// ==========================================

const addProblemSteps = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);
        const { steps } = req.body;

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
            });
        }

        if (!Array.isArray(steps) || steps.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one logical step is required."
            });
        }

        for (const step of steps) {
            if (
                typeof step !== "string" ||
                !step.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Every step must contain valid text."
                });
            }
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

        await db.query(
            `DELETE FROM logic_to_code_steps
             WHERE problem_id = ?`,
            [problemId]
        );

        const values = steps.map((step, index) => [
            problemId,
            index + 1,
            step.trim()
        ]);

        await db.query(
            `INSERT INTO logic_to_code_steps
             (problem_id, step_number, step_description)
             VALUES ?`,
            [values]
        );

        return res.status(201).json({
            success: true,
            message: "Problem steps saved successfully.",
            totalSteps: steps.length
        });

    } catch (error) {
        console.error("Add Problem Steps Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// ==========================================
// GET LOGIC STEPS FOR A PROBLEM
// ==========================================

const getProblemSteps = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
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

        const [steps] = await db.query(
            `SELECT id, problem_id, step_number, step_description
             FROM logic_to_code_steps
             WHERE problem_id = ?
             ORDER BY step_number ASC`,
            [problemId]
        );

        return res.status(200).json({
            success: true,
            totalSteps: steps.length,
            steps
        });

    } catch (error) {
        console.error("Get Problem Steps Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

module.exports = {
    addProblemSteps,
    getProblemSteps
};
