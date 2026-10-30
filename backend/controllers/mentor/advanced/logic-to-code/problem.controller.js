//Allows a mentor to create a new coding problem.

const db = require("../../../../config/db");

// Create a new Logic to Code problem
const createProblem = async (req, res) => {
    try {
        const mentorId = req.user.id;

        const {
            title,
            description,
            difficulty,
            solution_unlock
        } = req.body;

        // Validate required fields
        if (
            !title ||
            typeof title !== "string" ||
            !title.trim() ||
            !description ||
            typeof description !== "string" ||
            !description.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required."
            });
        }

        // Validate difficulty
        const allowedDifficulties = ["easy", "medium", "hard"];

        if (
            difficulty &&
            !allowedDifficulties.includes(difficulty)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid difficulty level."
            });
        }

        // Validate solution unlock option
        const allowedUnlockOptions = [
            "after_attempt",
            "after_completion",
            "mentor_only"
        ];

        if (
            solution_unlock &&
            !allowedUnlockOptions.includes(solution_unlock)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid solution unlock option."
            });
        }

        const [result] = await db.query(
            `INSERT INTO logic_to_code_problems
            (mentor_id, title, description, difficulty, solution_unlock)
            VALUES (?, ?, ?, ?, ?)`,
            [
                mentorId,
                title.trim(),
                description.trim(),
                difficulty || "easy",
                solution_unlock || "after_completion"
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Problem created successfully.",
            problemId: result.insertId
        });

    } catch (error) {
        console.error("Create Logic to Code Problem Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

//Retrieves all problems created by the logged-in mentor.


const getMentorProblems = async (req, res) => {
    try {
        const mentorId = req.user.id;

        const [problems] = await db.query(
            `SELECT *
             FROM logic_to_code_problems
             WHERE mentor_id = ?
             ORDER BY created_at DESC`,
            [mentorId]
        );

        return res.status(200).json({
            success: true,
            count: problems.length,
            problems
        });

    } catch (error) {
        console.error("Get Mentor Problems Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

//Retrieves one specific problem using its ID.


const getProblemById = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        // Validate problem ID
        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
            });
        }

        const [problems] = await db.query(
            `SELECT *
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

        return res.status(200).json({
            success: true,
            problem: problems[0]
        });

    } catch (error) {
        console.error("Get Problem By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


const updateProblem = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        const {
            title,
            description,
            difficulty,
            solution_unlock
        } = req.body;

        // Validate problem ID
        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
            });
        }

        // Check whether at least one field is provided
        if (
            title === undefined &&
            description === undefined &&
            difficulty === undefined &&
            solution_unlock === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required to update."
            });
        }

        // Validate title
        if (
            title !== undefined &&
            (typeof title !== "string" || !title.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Title cannot be empty."
            });
        }

        // Validate description
        if (
            description !== undefined &&
            (typeof description !== "string" || !description.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Description cannot be empty."
            });
        }

        // Validate difficulty
        const allowedDifficulties = ["easy", "medium", "hard"];

        if (
            difficulty !== undefined &&
            !allowedDifficulties.includes(difficulty)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid difficulty level."
            });
        }

        // Validate solution unlock option
        const allowedUnlockOptions = [
            "after_attempt",
            "after_completion",
            "mentor_only"
        ];

        if (
            solution_unlock !== undefined &&
            !allowedUnlockOptions.includes(solution_unlock)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid solution unlock option."
            });
        }

        // Check mentor ownership
        const [existingProblems] = await db.query(
            `SELECT id
             FROM logic_to_code_problems
             WHERE id = ? AND mentor_id = ?`,
            [problemId, mentorId]
        );

        if (existingProblems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Problem not found."
            });
        }

        // Build update query using allowed fields only
        const updates = [];
        const values = [];

        if (title !== undefined) {
            updates.push("title = ?");
            values.push(title.trim());
        }

        if (description !== undefined) {
            updates.push("description = ?");
            values.push(description.trim());
        }

        if (difficulty !== undefined) {
            updates.push("difficulty = ?");
            values.push(difficulty);
        }

        if (solution_unlock !== undefined) {
            updates.push("solution_unlock = ?");
            values.push(solution_unlock);
        }

        values.push(problemId, mentorId);

        await db.query(
            `UPDATE logic_to_code_problems
             SET ${updates.join(", ")}
             WHERE id = ? AND mentor_id = ?`,
            values
        );

        // Fetch updated problem
        const [updatedProblems] = await db.query(
            `SELECT *
             FROM logic_to_code_problems
             WHERE id = ? AND mentor_id = ?`,
            [problemId, mentorId]
        );

        return res.status(200).json({
            success: true,
            message: "Problem updated successfully.",
            problem: updatedProblems[0]
        });

    } catch (error) {
        console.error("Update Problem Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


module.exports = {
    createProblem,
    getMentorProblems,
    getProblemById,
    updateProblem
};
