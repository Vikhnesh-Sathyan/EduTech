
const db = require("../../../../config/db");

// ==========================================
// GET THEORY CHALLENGE ATTEMPT RESULT
// ==========================================

const getStudentTheoryChallengeAttemptResult = async (req, res) => {
    try {

        const studentId = req.user.id;
        const attemptId = req.params.attemptId;

        const [attempts] = await db.query(
            `
            SELECT
                tca.id,
                tca.challenge_id,
                tca.attempt_number,
                tca.submitted_content,
                tca.score,
                tca.evaluation_details,
                tca.feedback,
                tca.result_status,
                tca.reviewed_by,
                tca.submitted_at,
                tca.reviewed_at,

                tc.title AS challenge_title,
                tc.difficulty,
                tc.instructions,

                s.name AS subject_name,

                tct.name AS challenge_type_name,

                reviewer.name AS reviewer_name

            FROM theory_challenge_attempts tca

            INNER JOIN theory_challenges tc
                ON tc.id = tca.challenge_id

            INNER JOIN subjects s
                ON s.id = tc.subject_id

            INNER JOIN theory_challenge_types tct
                ON tct.id = tc.challenge_type_id

            LEFT JOIN users reviewer
                ON reviewer.id = tca.reviewed_by

            WHERE tca.id = ?
              AND tca.student_id = ?

            LIMIT 1
            `,
            [attemptId, studentId]
        );

        if (attempts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found"
            });
        }

        return res.status(200).json({
            success: true,
            attempt: attempts[0]
        });

    } catch (error) {

        console.error(
            "Theory Challenge Attempt Result Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load attempt result"
        });

    }
};

module.exports = {
    getStudentTheoryChallengeAttemptResult
};
