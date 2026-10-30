
const db = require("../../../../config/db");

// ==========================================
// ADD REFERENCE SOLUTION
// ==========================================

const addProblemSolution = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        const {
            language,
            solution_code,
            solution_explanation
        } = req.body;

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
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

        const [existing] = await db.query(
            `SELECT id
             FROM logic_to_code_solutions
             WHERE problem_id = ? AND language = ?`,
            [problemId, language]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "A solution for this language already exists."
            });
        }

        const [result] = await db.query(
            `INSERT INTO logic_to_code_solutions
             (
                problem_id,
                language,
                solution_code,
                solution_explanation
             )
             VALUES (?, ?, ?, ?)`,
            [
                problemId,
                language,
                solution_code,
                solution_explanation?.trim() || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Reference solution added successfully.",
            solutionId: result.insertId
        });

    } catch (error) {
        console.error("Add Problem Solution Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// ==========================================
// GET MENTOR REFERENCE SOLUTIONS
// ==========================================

const getProblemSolutions = async (req, res) => {
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

        const [solutions] = await db.query(
            `SELECT id, problem_id, language,
                    solution_code, solution_explanation,
                    created_at, updated_at
             FROM logic_to_code_solutions
             WHERE problem_id = ?
             ORDER BY language ASC`,
            [problemId]
        );

        return res.status(200).json({
            success: true,
            totalSolutions: solutions.length,
            solutions
        });

    } catch (error) {
        console.error("Get Problem Solutions Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

module.exports = {
    addProblemSolution,
    getProblemSolutions
};
