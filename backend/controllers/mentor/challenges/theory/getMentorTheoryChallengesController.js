const db = require("../../../../config/db");

// ==========================================
// GET MENTOR THEORY CHALLENGES
// ==========================================

const getMentorTheoryChallenges = async (req, res) => {
    try {

        const mentorId = req.user.id;

        const [challenges] = await db.query(
            `
            SELECT
                tc.id,
                tc.subject_id,
                tc.challenge_type_id,
                tc.title,
                tc.difficulty,
                tc.instructions,
                tc.status,
                tc.publish_at,
                tc.created_at,
                tc.updated_at,

                s.name AS subject_name,

                tct.name AS challenge_type_name,
                tct.type_key AS challenge_type_key,

                (
                    SELECT COUNT(*)
                    FROM theory_challenge_attempts tca
                    WHERE tca.challenge_id = tc.id
                ) AS total_attempts,

                (
                    SELECT COUNT(DISTINCT tca.student_id)
                    FROM theory_challenge_attempts tca
                    WHERE tca.challenge_id = tc.id
                ) AS total_students

            FROM theory_challenges tc

            INNER JOIN subjects s
                ON s.id = tc.subject_id

            INNER JOIN theory_challenge_types tct
                ON tct.id = tc.challenge_type_id

            WHERE tc.created_by = ?

            ORDER BY tc.created_at DESC
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
            "Mentor Theory Challenges Fetch Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load Mentor Theory Challenges"
        });

    }
};

module.exports = {
    getMentorTheoryChallenges
};