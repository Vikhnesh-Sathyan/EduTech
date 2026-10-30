
const db = require("../../../../config/db");

// ==========================================
// SAVE PROBLEM HINTS
// ==========================================

const saveProblemHints = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);
        const { hints } = req.body;

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
            });
        }

        if (!Array.isArray(hints) || hints.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one hint is required."
            });
        }

        for (const hint of hints) {
            if (typeof hint !== "string" || !hint.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Every hint must contain valid text."
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
            `DELETE FROM logic_to_code_hints
             WHERE problem_id = ?`,
            [problemId]
        );

        const values = hints.map((hint, index) => [
            problemId,
            index + 1,
            hint.trim()
        ]);

        await db.query(
            `INSERT INTO logic_to_code_hints
             (problem_id, hint_number, hint_content)
             VALUES ?`,
            [values]
        );

        return res.status(201).json({
            success: true,
            message: "Problem hints saved successfully.",
            totalHints: hints.length
        });

    } catch (error) {
        console.error("Save Problem Hints Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// ==========================================
// GET PROBLEM HINTS
// ==========================================

const getProblemHints = async (req, res) => {
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

        const [hints] = await db.query(
            `SELECT id, problem_id, hint_number, hint_content
             FROM logic_to_code_hints
             WHERE problem_id = ?
             ORDER BY hint_number ASC`,
            [problemId]
        );

        return res.status(200).json({
            success: true,
            totalHints: hints.length,
            hints
        });

    } catch (error) {
        console.error("Get Problem Hints Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

module.exports = {
    saveProblemHints,
    getProblemHints
};
