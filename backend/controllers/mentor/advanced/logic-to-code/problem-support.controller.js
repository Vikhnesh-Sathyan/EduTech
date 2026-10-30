
const db = require("../../../../config/db");

// ==========================================
// SAVE LEARNING SUPPORT
// ==========================================

const saveProblemSupport = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        const {
            sample_code_title,
            sample_code_description,
            sample_code,
            sample_code_language,
            starter_code,
            starter_code_language
        } = req.body;

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

        const allowedLanguages = ["python", "javascript", "java"];

        if (
            sample_code_language &&
            !allowedLanguages.includes(sample_code_language)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid sample code language."
            });
        }

        if (
            starter_code_language &&
            !allowedLanguages.includes(starter_code_language)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid starter code language."
            });
        }

        if (
            sample_code &&
            !sample_code_language
        ) {
            return res.status(400).json({
                success: false,
                message: "Sample code language is required."
            });
        }

        if (
            starter_code &&
            !starter_code_language
        ) {
            return res.status(400).json({
                success: false,
                message: "Starter code language is required."
            });
        }

        const [existing] = await db.query(
            `SELECT id
             FROM logic_to_code_support
             WHERE problem_id = ?`,
            [problemId]
        );

        if (existing.length > 0) {
            await db.query(
                `UPDATE logic_to_code_support
                 SET sample_code_title = ?,
                     sample_code_description = ?,
                     sample_code = ?,
                     sample_code_language = ?,
                     starter_code = ?,
                     starter_code_language = ?
                 WHERE problem_id = ?`,
                [
                    sample_code_title || null,
                    sample_code_description || null,
                    sample_code || null,
                    sample_code_language || null,
                    starter_code || null,
                    starter_code_language || null,
                    problemId
                ]
            );
        } else {
            await db.query(
                `INSERT INTO logic_to_code_support
                (
                    problem_id,
                    sample_code_title,
                    sample_code_description,
                    sample_code,
                    sample_code_language,
                    starter_code,
                    starter_code_language
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    problemId,
                    sample_code_title || null,
                    sample_code_description || null,
                    sample_code || null,
                    sample_code_language || null,
                    starter_code || null,
                    starter_code_language || null
                ]
            );
        }

        return res.status(200).json({
            success: true,
            message: "Learning support saved successfully."
        });

    } catch (error) {
        console.error("Save Problem Support Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// ==========================================
// GET LEARNING SUPPORT
// ==========================================

const getProblemSupport = async (req, res) => {
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

        const [support] = await db.query(
            `SELECT *
             FROM logic_to_code_support
             WHERE problem_id = ?`,
            [problemId]
        );

        return res.status(200).json({
            success: true,
            support: support[0] || null
        });

    } catch (error) {
        console.error("Get Problem Support Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

module.exports = {
    saveProblemSupport,
    getProblemSupport
};
