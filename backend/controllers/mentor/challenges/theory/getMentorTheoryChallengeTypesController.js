const db = require("../../../../config/db");

// ==========================================
// GET ACTIVE THEORY CHALLENGE TYPES
// ==========================================

const getMentorTheoryChallengeTypes = async (req, res) => {
    try {

        const [types] = await db.query(
            `SELECT
                id,
                type_key,
                name,
                description,
                content_schema
             FROM theory_challenge_types
             WHERE status = 'active'
             ORDER BY name ASC`
        );

        return res.status(200).json({
            success: true,
            count: types.length,
            types
        });

    } catch (error) {

        console.error(
            "Get Mentor Theory Challenge Types Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch Theory Challenge types"
        });
    }
};

module.exports = {
    getMentorTheoryChallengeTypes
};