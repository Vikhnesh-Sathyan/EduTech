const db = require("../../../../config/db");

// ==========================================
// GET MENTOR CODING CHALLENGE BY ID
// ==========================================

const getMentorCodingChallengeById = async (req, res) => {
    try {

        const mentorId = req.user.id;
        const { challengeId } = req.params;

        const [challenges] = await db.query(
            `
            SELECT
                cc.id,
                cc.subject_id,
                cc.challenge_type_id,
                cc.title,
                cc.difficulty,
                cc.instructions,
                cc.challenge_content,
                cc.status,
                cc.publish_at,
                cc.created_by,
                cc.created_at,
                cc.updated_at,

                s.name AS subject_name,

                cct.name AS challenge_type_name,
                cct.type_key AS challenge_type_key,
                cct.content_schema

            FROM coding_challenges cc

            INNER JOIN subjects s
                ON s.id = cc.subject_id

            INNER JOIN coding_challenge_types cct
                ON cct.id = cc.challenge_type_id

            WHERE cc.id = ?
              AND cc.created_by = ?

            LIMIT 1
            `,
            [challengeId, mentorId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Coding Challenge not found"
            });
        }

        return res.status(200).json({
            success: true,
            challenge: challenges[0]
        });

    } catch (error) {

        console.error(
            "Mentor Coding Challenge Details Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load Coding Challenge details"
        });

    }
};

module.exports = {
    getMentorCodingChallengeById
};