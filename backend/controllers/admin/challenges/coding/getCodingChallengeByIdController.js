
const db = require("../../../../config/db");


// ==========================================
// GET CODING CHALLENGE BY ID
// ==========================================

const getCodingChallengeById = async (req, res) => {

    const { challengeId } = req.params;

    try {

        const sql = `
            SELECT
                cc.*,

                s.name AS subject_name,
                ct.name AS challenge_type_name,
                ct.type_key AS challenge_type_key,
                ct.content_schema,
                u.name AS created_by_name

            FROM coding_challenges cc

            INNER JOIN subjects s
                ON s.id = cc.subject_id

            INNER JOIN coding_challenge_types ct
                ON ct.id = cc.challenge_type_id

            INNER JOIN users u
                ON u.id = cc.created_by

            WHERE cc.id = ?
        `;

        const [challenges] = await db.query(
            sql,
            [challengeId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({
                message: "Coding challenge not found"
            });
        }

        res.status(200).json({
            challenge: challenges[0]
        });

    } catch (err) {

        console.error(
            "Coding challenge details fetch failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to fetch coding challenge details"
        });
    }
};


module.exports = {
    getCodingChallengeById
};
