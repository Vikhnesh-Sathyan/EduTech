
const db = require("../../../../config/db");

// ==========================================
// GET MENTOR CODING CHALLENGE SUBMISSIONS
// ==========================================

const getMentorCodingChallengeSubmissions = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const { challengeId } = req.params;

        // Check whether this challenge belongs to the mentor
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

        // Get student submissions
        const [submissions] = await db.query(
            `
            SELECT
                cca.id AS attempt_id,
                cca.challenge_id,
                cca.student_id,
                cca.attempt_number,
                cca.submitted_content,
                cca.result_status,
                cca.feedback,
                cca.submitted_at,
                cca.evaluated_at,

                u.name AS student_name,
                u.email AS student_email

            FROM coding_challenge_attempts cca

            INNER JOIN users u
                ON u.id = cca.student_id

            WHERE cca.challenge_id = ?

            ORDER BY cca.submitted_at DESC
            `,
            [challengeId]
        );

        return res.status(200).json({
            success: true,
            total: submissions.length,
            submissions
        });

    } catch (error) {
        console.error(
            "Get Mentor Coding Challenge Submissions Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch challenge submissions"
        });
    }
};

module.exports = {
    getMentorCodingChallengeSubmissions
};
