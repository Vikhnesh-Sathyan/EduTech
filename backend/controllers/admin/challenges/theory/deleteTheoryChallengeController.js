const db = require("../../../../config/db");

// ==========================================
// DELETE THEORY CHALLENGE
// ==========================================

const deleteTheoryChallenge = async (req, res) => {

    let connection;

    try {

        const { challengeId } = req.params;

        // Validate challenge ID
        if (!challengeId || isNaN(Number(challengeId))) {
            return res.status(400).json({
                success: false,
                message: "Invalid challenge ID"
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        // Check whether challenge exists and lock its row
        const [challenges] = await connection.query(
            `SELECT id, title
             FROM theory_challenges
             WHERE id = ?
             FOR UPDATE`,
            [challengeId]
        );

        if (challenges.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Theory challenge not found"
            });
        }

        // Check student attempt history
        const [attempts] = await connection.query(
            `SELECT id
             FROM theory_challenge_attempts
             WHERE challenge_id = ?
             LIMIT 1`,
            [challengeId]
        );

        // Protect student history
        if (attempts.length > 0) {

            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "This challenge has student attempts and cannot be deleted. Archive it instead."
            });
        }

        // Delete challenge
        await connection.query(
            `DELETE FROM theory_challenges
             WHERE id = ?`,
            [challengeId]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Theory challenge deleted successfully"
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Delete Theory Challenge Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete theory challenge"
        });

    } finally {

        if (connection) {
            connection.release();
        }

    }
};

module.exports = {
    deleteTheoryChallenge
};