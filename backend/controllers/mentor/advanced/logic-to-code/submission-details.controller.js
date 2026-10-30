const db = require("../../../../config/db");

// =====================================================
// GET SINGLE SUBMISSION DETAILS
// =====================================================

const getMentorSubmissionDetails = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const submissionId = Number(req.params.submissionId);

        // ---------------------------------------------
        // VALIDATE SUBMISSION ID
        // ---------------------------------------------

        if (
            !Number.isInteger(submissionId) ||
            submissionId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid submission ID"
            });
        }

        // ---------------------------------------------
        // GET SUBMISSION DETAILS
        // ---------------------------------------------

        const [submissions] = await db.query(
            `SELECT
                s.id,
                s.problem_id,
                p.title AS problem_title,
                p.difficulty,
                u.id AS student_id,
                u.name AS student_name,
                u.email AS student_email,
                s.language,
                s.source_code,
                s.submission_number,
                s.execution_status,
                s.passed_test_cases,
                s.total_test_cases,
                s.execution_time_ms,
                s.memory_used_kb,
                s.error_message,
                s.test_results,
                s.mentor_feedback,
                s.review_status,
                s.submitted_at,
                s.reviewed_at
             FROM logic_to_code_submissions s
             JOIN logic_to_code_problems p
                ON p.id = s.problem_id
             JOIN users u
                ON u.id = s.student_id
             WHERE s.id = ?
               AND p.mentor_id = ?
             LIMIT 1`,
            [submissionId, mentorId]
        );

        // ---------------------------------------------
        // CHECK SUBMISSION
        // ---------------------------------------------

        if (submissions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        // ---------------------------------------------
        // SEND RESPONSE
        // ---------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Submission details loaded successfully",
            submission: submissions[0]
        });

    } catch (error) {
        console.error("Submission Details Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load submission details"
        });
    }
};

module.exports = {
    getMentorSubmissionDetails
};