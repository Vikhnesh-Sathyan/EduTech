const db = require("../../../../config/db");

// ==========================================
// CREATE CODING CHALLENGE
// ==========================================

const createCodingChallenge = async (req, res) => {

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

    if (
        !["easy", "medium", "hard"].includes(difficulty)
    ) {
        return res.status(400).json({
            message: "Difficulty must be easy, medium or hard"
        });
    }


    try {

        // ==========================================
        // CHECK SUBJECT
        // ==========================================

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


        // ==========================================
        // CHECK CODING CHALLENGE TYPE
        // ==========================================

        const [challengeTypes] = await db.query(
            `SELECT id
             FROM coding_challenge_types
             WHERE id = ?
             AND status = 'active'`,
            [challenge_type_id]
        );

        if (challengeTypes.length === 0) {
            return res.status(404).json({
                message: "Active coding challenge type not found"
            });
        }


        // ==========================================
        // INSERT CODING CHALLENGE
        // ==========================================

        const sql = `
            INSERT INTO coding_challenges
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
            VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
        `;

        const [result] = await db.query(
            sql,
            [
                subject_id,
                challenge_type_id,
                req.user.id,
                title.trim(),
                difficulty,
                instructions.trim(),
                JSON.stringify(challenge_content)
            ]
        );


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        res.status(201).json({
            message: "Coding challenge created successfully",
            challengeId: result.insertId
        });

    } catch (err) {

        console.error(
            "Coding challenge creation failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to create coding challenge"
        });
    }
};

module.exports = {
    createCodingChallenge,
};