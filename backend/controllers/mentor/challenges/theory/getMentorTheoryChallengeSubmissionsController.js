const db = require("../../../../config/db");

// ==========================================
// GET MENTOR THEORY CHALLENGE SUBMISSIONS
// ==========================================

const getMentorTheoryChallengeSubmissions = async (req, res) => {
    try {

        const mentorId = req.user.id;

        const [submissions] = await db.query(
            `
            SELECT
                tca.id AS attempt_id,
                tca.challenge_id,
                tca.student_id,
                tca.attempt_number,
                tca.submitted_content,
                tca.score,
                tca.evaluation_details,
                tca.feedback,
                tca.result_status,
                tca.submitted_at,
                tca.reviewed_at,

                tc.title AS challenge_title,
                tc.difficulty,

                s.name AS subject_name,

                tct.name AS challenge_type_name,

                student.name AS student_name,
                student.email AS student_email,

                reviewer.name AS reviewer_name

            FROM theory_challenge_attempts tca

            INNER JOIN theory_challenges tc
                ON tc.id = tca.challenge_id

            INNER JOIN subjects s
                ON s.id = tc.subject_id

            INNER JOIN theory_challenge_types tct
                ON tct.id = tc.challenge_type_id

            INNER JOIN users student
                ON student.id = tca.student_id

            LEFT JOIN users reviewer
                ON reviewer.id = tca.reviewed_by

            WHERE tc.created_by = ?

            ORDER BY tca.submitted_at DESC
            `,
            [mentorId]
        );

        return res.status(200).json({
            success: true,
            count: submissions.length,
            submissions
        });

    } catch (error) {

        console.error(
            "Mentor Theory Challenge Submissions Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load Theory Challenge submissions"
        });

    }
};

module.exports = {
    getMentorTheoryChallengeSubmissions
};