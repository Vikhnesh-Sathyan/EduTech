
const db = require("../../../../config/db");

// ==========================================
// UPDATE THEORY CHALLENGE
// ==========================================

const updateTheoryChallenge = async (req, res) => {
    try {

        const { challengeId } = req.params;

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

        // Check whether challenge exists and is draft
        const [existingChallenges] = await db.query(
            `SELECT id
             FROM theory_challenges
             WHERE id = ? AND status = 'draft'`,
            [challengeId]
        );

        if (existingChallenges.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Draft Theory Challenge not found"
            });
        }

        // Check active subject
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

        // Check active Theory Challenge Type
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

        // Update challenge
        await db.query(
            `UPDATE theory_challenges
             SET
                subject_id = ?,
                challenge_type_id = ?,
                title = ?,
                difficulty = ?,
                instructions = ?,
                challenge_content = ?
             WHERE id = ? AND status = 'draft'`,
            [
                subject_id,
                challenge_type_id,
                title.trim(),
                difficulty || "easy",
                instructions.trim(),
                JSON.stringify(challenge_content),
                challengeId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Theory Challenge updated successfully"
        });

    } catch (error) {

        console.error("Update Theory Challenge Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating Theory Challenge"
        });

    }
};

module.exports = {
    updateTheoryChallenge
};
