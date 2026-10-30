
const db = require("../../../../config/db");

// ==========================================
// ADD COMMON MISTAKE
// ==========================================

const addProblemMistake = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        const {
            mistake_title,
            mistake_description
        } = req.body;

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
            });
        }

        if (
            typeof mistake_title !== "string" ||
            !mistake_title.trim() ||
            typeof mistake_description !== "string" ||
            !mistake_description.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Mistake title and description are required."
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
            `INSERT INTO logic_to_code_mistakes
             (problem_id, mistake_title, mistake_description)
             VALUES (?, ?, ?)`,
            [
                problemId,
                mistake_title.trim(),
                mistake_description.trim()
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Common mistake added successfully.",
            mistakeId: result.insertId
        });

    } catch (error) {
        console.error("Add Problem Mistake Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// ==========================================
// GET COMMON MISTAKES
// ==========================================

const getProblemMistakes = async (req, res) => {
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

        const [mistakes] = await db.query(
            `SELECT id, problem_id, mistake_title,
                    mistake_description, created_at
             FROM logic_to_code_mistakes
             WHERE problem_id = ?
             ORDER BY id ASC`,
            [problemId]
        );

        return res.status(200).json({
            success: true,
            totalMistakes: mistakes.length,
            mistakes
        });

    } catch (error) {
        console.error("Get Problem Mistakes Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// ==========================================
// UPDATE COMMON MISTAKE
// ==========================================

const updateProblemMistake = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);
        const mistakeId = Number(req.params.mistakeId);

        const {
            mistake_title,
            mistake_description
        } = req.body;

        if (
            !Number.isInteger(problemId) ||
            problemId <= 0 ||
            !Number.isInteger(mistakeId) ||
            mistakeId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem or mistake ID."
            });
        }

        if (
            typeof mistake_title !== "string" ||
            !mistake_title.trim() ||
            typeof mistake_description !== "string" ||
            !mistake_description.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Mistake title and description are required."
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
            `UPDATE logic_to_code_mistakes
             SET mistake_title = ?,
                 mistake_description = ?
             WHERE id = ? AND problem_id = ?`,
            [
                mistake_title.trim(),
                mistake_description.trim(),
                mistakeId,
                problemId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Common mistake not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Common mistake updated successfully."
        });

    } catch (error) {
        console.error("Update Problem Mistake Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// ==========================================
// DELETE COMMON MISTAKE
// ==========================================

const deleteProblemMistake = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);
        const mistakeId = Number(req.params.mistakeId);

        if (
            !Number.isInteger(problemId) ||
            problemId <= 0 ||
            !Number.isInteger(mistakeId) ||
            mistakeId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem or mistake ID."
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
            `DELETE FROM logic_to_code_mistakes
             WHERE id = ? AND problem_id = ?`,
            [mistakeId, problemId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Common mistake not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Common mistake deleted successfully."
        });

    } catch (error) {
        console.error("Delete Problem Mistake Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

module.exports = {
    addProblemMistake,
    getProblemMistakes,
    updateProblemMistake,
    deleteProblemMistake
};
