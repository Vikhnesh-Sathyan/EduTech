
const db = require("../../../../config/db");

// ==========================================
// GET STUDENT CODING CHALLENGE HISTORY
// ==========================================

const getStudentCodingChallengeHistory = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [attempts] = await db.query(
            `
            SELECT
                cca.id AS attempt_id,
                cca.challenge_id,
                cca.attempt_number,
                cca.result_status AS review_status,
                cca.feedback,
                cca.submitted_at,
                cca.evaluated_at AS reviewed_at,

                cc.title AS challenge_title,
                cc.difficulty,

                s.name AS subject_name,

                cct.name AS challenge_type_name,
                cct.type_key AS challenge_type_key,

                creator.name AS created_by_name

            FROM coding_challenge_attempts cca

            INNER JOIN coding_challenges cc
                ON cc.id = cca.challenge_id

            INNER JOIN subjects s
                ON s.id = cc.subject_id

            INNER JOIN coding_challenge_types cct
                ON cct.id = cc.challenge_type_id

            INNER JOIN users creator
                ON creator.id = cc.created_by

            WHERE cca.student_id = ?

            ORDER BY cca.submitted_at DESC
            `,
            [studentId]
        );

        return res.status(200).json({
            success: true,
            count: attempts.length,
            attempts
        });

    } catch (error) {
        console.error(
            "Student Coding Challenge History Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load Coding Challenge history"
        });
    }
};

module.exports = {
    getStudentCodingChallengeHistory
};
