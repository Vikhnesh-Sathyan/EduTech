
const db = require("../../../../config/db");


// ==========================================
// GET ALL CODING CHALLENGES
// ==========================================

const getCodingChallenges = async (req, res) => {

    const sql = `
        SELECT
            cc.id,
            cc.subject_id,
            cc.challenge_type_id,
            cc.created_by,
            cc.title,
            cc.difficulty,
            cc.status,
            cc.publish_at,
            cc.created_at,

            s.name AS subject_name,
            ct.name AS challenge_type_name,
            u.name AS created_by_name

        FROM coding_challenges cc

        INNER JOIN subjects s
            ON s.id = cc.subject_id

        INNER JOIN coding_challenge_types ct
            ON ct.id = cc.challenge_type_id

        INNER JOIN users u
            ON u.id = cc.created_by

        ORDER BY cc.created_at DESC
    `;

    try {

        const [challenges] = await db.query(sql);

        res.status(200).json({
            challenges
        });

    } catch (err) {

        console.error(
            "Coding challenges fetch failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to fetch coding challenges"
        });
    }
};


module.exports = {
    getCodingChallenges
};
