
const db = require("../../../../config/db");

// ==========================================
// CREATE THEORY CHALLENGE
// ==========================================

const createTheoryChallenge = async (req, res) => {
    try {
        const {
            subject_id,
            challenge_type_id,
            title,
            difficulty,
            instructions,
            challenge_content
        } = req.body;

        // Validate required fields
        if (
            !subject_id ||
            !challenge_type_id ||
            !title ||
            !instructions ||
            !challenge_content
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Validate difficulty
        const allowedDifficulties = ["easy", "medium", "hard"];

        if (!allowedDifficulties.includes(difficulty || "easy")) {
            return res.status(400).json({
                success: false,
                message: "Invalid difficulty"
            });
        }

        // Validate challenge content
        if (
            typeof challenge_content !== "object" ||
            Array.isArray(challenge_content) ||
            challenge_content === null
        ) {
            return res.status(400).json({
                success: false,
                message: "Challenge content must be a valid JSON object"
            });
        }

        // Check whether subject exists and is active
        const [subjects] = await db.query(
            `SELECT id
             FROM subjects
             WHERE id = ? AND status = 'active'`,
            [subject_id]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Active subject not found"
            });
        }

        // Check whether Theory Challenge Type exists and is active
        const [types] = await db.query(
            `SELECT id
             FROM theory_challenge_types
             WHERE id = ? AND status = 'active'`,
            [challenge_type_id]
        );

        if (types.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Active Theory Challenge Type not found"
            });
        }

        // Insert Theory Challenge
        const [result] = await db.query(
            `INSERT INTO theory_challenges
            (
                subject_id,
                challenge_type_id,
                created_by,
                title,
                difficulty,
                instructions,
                challenge_content,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [
                subject_id,
                challenge_type_id,
                req.user.id,
                title.trim(),
                difficulty || "easy",
                instructions.trim(),
                JSON.stringify(challenge_content)
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Theory Challenge created successfully",
            challengeId: result.insertId
        });

    } catch (error) {
        console.error("Create Theory Challenge Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating Theory Challenge"
        });
    }
};

module.exports = {
    createTheoryChallenge
};
