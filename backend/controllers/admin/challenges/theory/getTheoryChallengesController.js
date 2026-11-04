
const db = require("../../../../config/db");

// ==========================================
// GET ALL THEORY CHALLENGES
// ==========================================

const getTheoryChallenges = async (req, res) => {
    try {

        const [challenges] = await db.query(
            `SELECT
                tc.id,
                tc.subject_id,
                tc.challenge_type_id,
                tc.created_by,
                tc.title,
                tc.difficulty,
                tc.status,
                tc.publish_at,
                tc.created_at,

                s.name AS subject_name,
                t.name AS challenge_type_name,
                u.name AS created_by_name

            FROM theory_challenges tc

            INNER JOIN subjects s
                ON tc.subject_id = s.id

            INNER JOIN theory_challenge_types t
                ON tc.challenge_type_id = t.id

            INNER JOIN users u
                ON tc.created_by = u.id

            ORDER BY tc.created_at DESC`
        );

        return res.status(200).json({
            success: true,
            count: challenges.length,
            challenges
        });

    } catch (error) {

        console.error("Get Theory Challenges Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching Theory Challenges"
        });

    }
};

module.exports = {
    getTheoryChallenges
};
