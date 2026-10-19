
const db = require("../../../config/db");

// ==========================================
// GET ACTIVE TECHNOLOGIES FOR MENTOR CHEAT SHEET
// ==========================================
const getTechnologies = async (req, res) => {
    try {
        const [technologies] = await db.query(
            `SELECT
                id,
                name,
                sort_name,
                description
             FROM developer_technologies
             WHERE status = 'active'
             ORDER BY sort_name ASC, name ASC`
        );

        return res.status(200).json({
            message: "Technologies retrieved successfully",
            technologies
        });
    } catch (error) {
        console.error(
            "Get mentor cheat sheet technologies error:",
            error
        );

        return res.status(500).json({
            message: "Failed to retrieve technologies"
        });
    }
};

module.exports = {
    getTechnologies
};
