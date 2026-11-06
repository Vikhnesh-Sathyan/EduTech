const db = require("../../../../config/db");

// ==========================================
// DELETE MENTOR CODING CHALLENGE
// ==========================================

const deleteMentorCodingChallenge = async (req, res) => {
    try {

        const mentorId = req.user.id;
        const { challengeId } = req.params;

        // Verify challenge ownership
        const [challenges] = await db.query(
            `
            SELECT id
            FROM coding_challenges
            WHERE id = ?
              AND created_by = ?
            LIMIT 1
            `,
            [challengeId, mentorId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Coding Challenge not found"
            });
        }

        // Check existing student attempts
        const [attempts] = await db.query(
            `
            SELECT COUNT(*) AS total_attempts
            FROM coding_challenge_attempts
            WHERE challenge_id = ?
            `,
            [challengeId]
        );

        if (attempts[0].total_attempts > 0) {
            return res.status(409).json({
                success: false,
                message: "This challenge has student attempts and cannot be deleted."
            });
        }

        // Delete challenge
        await db.query(
            `
            DELETE FROM coding_challenges
            WHERE id = ?
              AND created_by = ?
            `,
            [challengeId, mentorId]
        );

        return res.status(200).json({
            success: true,
            message: "Coding Challenge deleted successfully"
        });

    } catch (error) {

        console.error(
            "Mentor Coding Challenge Delete Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete Coding Challenge"
        });

    }
};

module.exports = {
    deleteMentorCodingChallenge
};