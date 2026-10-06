// Handles mentor dashboard data

const db = require("../config/db");


// ==========================================
// GET MENTOR DASHBOARD
// ==========================================

const getMentorDashboard = async (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT
            mp.verification_status,
            mp.verification_note
        FROM mentor_profiles mp
        WHERE mp.user_id = ?
    `;

    try {

        const [result] = await db.query(
            sql,
            [userId]
        );

        if (result.length === 0) {
            return res.status(404).json({
                message: "Mentor profile not found"
            });
        }

        res.status(200).json({
            verificationStatus: result[0].verification_status,
            verificationNote: result[0].verification_note
        });

    } catch (error) {

        console.error(
            "Mentor dashboard fetch failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load mentor dashboard"
        });
    }
};


module.exports = {
    getMentorDashboard
};