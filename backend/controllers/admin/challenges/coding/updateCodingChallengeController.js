
const db = require("../../../../config/db");


// ==========================================
// UPDATE CODING CHALLENGE
// ==========================================

const updateCodingChallenge = async (req, res) => {

    const { challengeId } = req.params;

    const {
        subject_id,
        challenge_type_id,
        title,
        difficulty,
        instructions,
        challenge_content
    } = req.body;


    // ==========================================
    // VALIDATE REQUIRED FIELDS
    // ==========================================

    if (
        !subject_id ||
        !challenge_type_id ||
        !title ||
        !title.trim() ||
        !instructions ||
        !instructions.trim() ||
        !challenge_content ||
        typeof challenge_content !== "object" ||
        Array.isArray(challenge_content)
    ) {
        return res.status(400).json({
            message: "All required coding challenge details must be provided"
        });
    }


    // ==========================================
    // VALIDATE DIFFICULTY
    // ==========================================

    if (!["easy", "medium", "hard"].includes(difficulty)) {
        return res.status(400).json({
            message: "Difficulty must be easy, medium or hard"
        });
    }


    try {

        // Check whether challenge exists and is draft
        const [challenges] = await db.query(
            `SELECT id
             FROM coding_challenges
             WHERE id = ?
             AND status = 'draft'`,
            [challengeId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({
                message: "Draft coding challenge not found"
            });
        }


        // Check active subject
        const [subjects] = await db.query(
            `SELECT id
             FROM subjects
             WHERE id = ?
             AND status = 'active'`,
            [subject_id]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                message: "Active subject not found"
            });
        }


        // Check active coding challenge type
        const [types] = await db.query(
            `SELECT id
             FROM coding_challenge_types
             WHERE id = ?
             AND status = 'active'`,
            [challenge_type_id]
        );

        if (types.length === 0) {
            return res.status(404).json({
                message: "Active coding challenge type not found"
            });
        }


        // Update challenge
        const sql = `
            UPDATE coding_challenges
            SET
                subject_id = ?,
                challenge_type_id = ?,
                title = ?,
                difficulty = ?,
                instructions = ?,
                challenge_content = ?
            WHERE id = ?
            AND status = 'draft'
        `;

        const [result] = await db.query(
            sql,
            [
                subject_id,
                challenge_type_id,
                title.trim(),
                difficulty,
                instructions.trim(),
                JSON.stringify(challenge_content),
                challengeId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Draft coding challenge not found"
            });
        }

        res.status(200).json({
            message: "Coding challenge updated successfully"
        });

    } catch (err) {

        console.error(
            "Coding challenge update failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to update coding challenge"
        });
    }
};


module.exports = {
    updateCodingChallenge
};
