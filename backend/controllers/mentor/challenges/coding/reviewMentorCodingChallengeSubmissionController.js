
const db = require("../../../../config/db");

// ==========================================
// REVIEW MENTOR CODING CHALLENGE SUBMISSION
// ==========================================

const reviewMentorCodingChallengeSubmission = async (req, res) => {
    let connection;

    try {
        const mentorId = req.user.id;
        const { attemptId } = req.params;
        const { result_status, feedback } = req.body;

        // Validate review status
        if (!["correct", "incorrect"].includes(result_status)) {
            return res.status(400).json({
                success: false,
                message: "Review status must be correct or incorrect"
            });
        }

        // Validate feedback
        if (
            feedback !== undefined &&
            feedback !== null &&
            typeof feedback !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Feedback must be valid text"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Find submission and verify mentor ownership
        const [attempts] = await connection.query(
            `
            SELECT
                cca.id,
                cca.result_status

            FROM coding_challenge_attempts cca

            INNER JOIN coding_challenges cc
                ON cc.id = cca.challenge_id

            WHERE cca.id = ?
              AND cc.created_by = ?

            FOR UPDATE
            `,
            [attemptId, mentorId]
        );

        if (attempts.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        // Prevent reviewing an already reviewed submission
        if (attempts[0].result_status !== "pending") {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "This submission has already been reviewed"
            });
        }

        // Save mentor review
        await connection.query(
            `
            UPDATE coding_challenge_attempts

            SET
                result_status = ?,
                feedback = ?,
                evaluated_at = NOW()

            WHERE id = ?
            `,
            [
                result_status,
                feedback?.trim() || null,
                attemptId
            ]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Submission reviewed successfully",
            attemptId,
            reviewStatus: result_status
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Mentor Coding Challenge Review Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to review submission"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    reviewMentorCodingChallengeSubmission
};
