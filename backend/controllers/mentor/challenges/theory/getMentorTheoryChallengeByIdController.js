const db = require("../../../../config/db");

// ==========================================
// GET MENTOR THEORY CHALLENGE BY ID
// ==========================================

const getMentorTheoryChallengeById = async (req, res) => {
    try {

        const mentorId = req.user.id;
        const { challengeId } = req.params;

        const [challenges] = await db.query(
            `
            SELECT
                tc.id,
                tc.subject_id,
                tc.challenge_type_id,
                tc.title,
                tc.difficulty,
                tc.instructions,
                tc.challenge_content,
                tc.status,
                tc.publish_at,
                tc.created_by,
                tc.created_at,
                tc.updated_at,

                s.name AS subject_name,

                tct.name AS challenge_type_name,
                tct.type_key AS challenge_type_key,
                tct.content_schema

            FROM theory_challenges tc

            INNER JOIN subjects s
                ON s.id = tc.subject_id

            INNER JOIN theory_challenge_types tct
                ON tct.id = tc.challenge_type_id

            WHERE tc.id = ?
              AND tc.created_by = ?

            LIMIT 1
            `,
            [challengeId, mentorId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Theory Challenge not found"
            });
        }

        return res.status(200).json({
            success: true,
            challenge: challenges[0]
        });

    } catch (error) {

        console.error(
            "Mentor Theory Challenge Details Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load Theory Challenge details"
        });

    }
};

module.exports = {
    getMentorTheoryChallengeById
};