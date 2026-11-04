
const db = require("../../../../config/db");

// ==========================================
// GET STUDENT CODING ATTEMPT RESULT
// ==========================================

const getStudentCodingChallengeAttemptResult = async (req, res) => {
    try {

        const studentId = req.user.id;
        const { attemptId } = req.params;

        const [attempts] = await db.query(
            `
            SELECT
                cca.id AS attempt_id,
                cca.challenge_id,
                cca.student_id,
                cca.attempt_number,
                cca.submitted_content,
                cca.score,
                cca.result_status,
                cca.feedback,
                cca.submitted_at,
                cca.evaluated_at,

                cc.title AS challenge_title,
                cc.difficulty,

                s.name AS subject_name,

                cct.name AS challenge_type_name,
                cct.type_key AS challenge_type_key

            FROM coding_challenge_attempts cca

            INNER JOIN coding_challenges cc
                ON cc.id = cca.challenge_id

            INNER JOIN subjects s
                ON s.id = cc.subject_id

            INNER JOIN coding_challenge_types cct
                ON cct.id = cc.challenge_type_id

            WHERE cca.id = ?
              AND cca.student_id = ?

            LIMIT 1
            `,
            [attemptId, studentId]
        );

        if (attempts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Coding Challenge attempt not found"
            });
        }

        return res.status(200).json({
            success: true,
            attempt: attempts[0]
        });

    } catch (error) {

        console.error(
            "Coding Challenge Attempt Result Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load attempt result"
        });

    }
};

module.exports = {
    getStudentCodingChallengeAttemptResult
};
