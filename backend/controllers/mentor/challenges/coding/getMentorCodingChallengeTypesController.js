
const db = require("../../../../config/db");

// ==========================================
// GET ACTIVE CODING CHALLENGE TYPES
// ==========================================

const getMentorCodingChallengeTypes = async (req, res) => {
    try {

        const [types] = await db.query(
            `
            SELECT
                id,
                type_key,
                name,
                description,
                content_schema

            FROM coding_challenge_types

            WHERE status = 'active'

            ORDER BY name ASC
            `
        );

        return res.status(200).json({
            success: true,
            count: types.length,
            types
        });

    } catch (error) {

        console.error(
            "Mentor Coding Challenge Types Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load Coding Challenge Types"
        });

    }
};

module.exports = {
    getMentorCodingChallengeTypes
};
