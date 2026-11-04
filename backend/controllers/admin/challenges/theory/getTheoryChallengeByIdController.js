
const db = require("../../../../config/db");

// ==========================================
// GET THEORY CHALLENGE BY ID
// ==========================================

const getTheoryChallengeById = async (req, res) => {
    try {

        const { challengeId } = req.params;

        const [challenges] = await db.query(
            `SELECT
                tc.*,
                s.name AS subject_name,
                t.name AS challenge_type_name,
                t.type_key AS challenge_type_key,
                t.content_schema,
                u.name AS created_by_name

            FROM theory_challenges tc

            INNER JOIN subjects s
                ON tc.subject_id = s.id

            INNER JOIN theory_challenge_types t
                ON tc.challenge_type_id = t.id

            INNER JOIN users u
                ON tc.created_by = u.id

            WHERE tc.id = ?`,
            [challengeId]
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

        console.error("Get Theory Challenge Details Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching Theory Challenge"
        });

    }
};

module.exports = {
    getTheoryChallengeById
};
