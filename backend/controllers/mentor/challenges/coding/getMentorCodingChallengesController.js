const db = require("../../../../config/db");

// ==========================================
// GET MENTOR CODING CHALLENGES
// ==========================================

const getMentorCodingChallenges = async (req, res) => {
    try {

        const mentorId = req.user.id;

        const [challenges] = await db.query(
            `
            SELECT
                cc.id,
                cc.subject_id,
                cc.challenge_type_id,
                cc.title,
                cc.difficulty,
                cc.instructions,
                cc.status,
                cc.publish_at,
                cc.created_at,
                cc.updated_at,

                s.name AS subject_name,

                cct.name AS challenge_type_name,
                cct.type_key AS challenge_type_key,

                (
                    SELECT COUNT(*)
                    FROM coding_challenge_attempts cca
                    WHERE cca.challenge_id = cc.id
                ) AS total_attempts,

                (
                    SELECT COUNT(DISTINCT cca.student_id)
                    FROM coding_challenge_attempts cca
                    WHERE cca.challenge_id = cc.id
                ) AS total_students

            FROM coding_challenges cc

            INNER JOIN subjects s
                ON s.id = cc.subject_id

            INNER JOIN coding_challenge_types cct
                ON cct.id = cc.challenge_type_id

            WHERE cc.created_by = ?

            ORDER BY cc.created_at DESC
            `,
            [mentorId]
        );

        return res.status(200).json({
            success: true,
            count: challenges.length,
            challenges
        });

    } catch (error) {

        console.error(
            "Mentor Coding Challenges Fetch Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load Mentor Coding Challenges"
        });

    }
};

module.exports = {
    getMentorCodingChallenges
};