
const db = require("../../../../config/db");

// ==========================================
// UPDATE THEORY CHALLENGE STATUS
// ==========================================

const updateTheoryChallengeStatus = async (req, res) => {
    try {

        const { challengeId } = req.params;
        const { status } = req.body;

        // Validate status
        const allowedStatuses = [
            "draft",
            "published",
            "archived"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid challenge status"
            });
        }

        // Check whether challenge exists
        const [challenges] = await db.query(
            `SELECT id
             FROM theory_challenges
             WHERE id = ?`,
            [challengeId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Theory Challenge not found"
            });
        }

        // Update status
        await db.query(
            `UPDATE theory_challenges
             SET
                status = ?,
                publish_at = CASE
                    WHEN ? = 'published' THEN CURRENT_TIMESTAMP
                    ELSE NULL
                END
             WHERE id = ?`,
            [
                status,
                status,
                challengeId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Theory Challenge status updated successfully",
            status
        });

    } catch (error) {

        console.error("Update Theory Challenge Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating Theory Challenge status"
        });

    }
};

module.exports = {
    updateTheoryChallengeStatus
};
