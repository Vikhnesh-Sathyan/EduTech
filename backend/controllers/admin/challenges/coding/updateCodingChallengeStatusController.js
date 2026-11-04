
const db = require("../../../../config/db");


// ==========================================
// UPDATE CODING CHALLENGE STATUS
// ==========================================

const updateCodingChallengeStatus = async (req, res) => {

    const { challengeId } = req.params;
    const { status } = req.body;


    // ==========================================
    // VALIDATE STATUS
    // ==========================================

    if (!["draft", "published", "archived"].includes(status)) {
        return res.status(400).json({
            message: "Invalid coding challenge status"
        });
    }


    try {

        // Check whether challenge exists
        const [challenges] = await db.query(
            `SELECT id, status
             FROM coding_challenges
             WHERE id = ?`,
            [challengeId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({
                message: "Coding challenge not found"
            });
        }


        // Update status
        const sql = `
            UPDATE coding_challenges
            SET
                status = ?,
                publish_at = CASE
                    WHEN ? = 'published' THEN CURRENT_TIMESTAMP
                    ELSE NULL
                END
            WHERE id = ?
        `;

        await db.query(
            sql,
            [status, status, challengeId]
        );


        res.status(200).json({
            message: "Coding challenge status updated successfully",
            status
        });

    } catch (err) {

        console.error(
            "Coding challenge status update failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to update coding challenge status"
        });
    }
};


module.exports = {
    updateCodingChallengeStatus
};
