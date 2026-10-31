
const db = require("../../../../config/db");

// =====================================================
// GET STUDENT SUBMISSION DETAILS
// =====================================================

const getStudentSubmissionDetails = async (req, res) => {
    try {
        const studentId = req.user.id;
       const submissionId = Number(req.params.submissionId);

if (
    !Number.isSafeInteger(submissionId) ||
    submissionId <= 0
) {
    return res.status(400).json({
        success: false,
        message: "Valid submission ID is required"
    });
} {
            return res.status(400).json({
                success: false,
                message: "Valid submission ID is required"
            });
        }

        // Fetch submission belonging to logged-in student
        const [submissions] = await db.query(
            `SELECT
                s.id,
                s.problem_id,
                p.title AS problem_title,
                p.difficulty,
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
                ON s.problem_id = p.id

             WHERE s.id = ?
             AND s.student_id = ?`,
            [submissionId, studentId]
        );

        if (submissions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Submission details fetched successfully",
            data: submissions[0]
        });

    } catch (error) {
        console.error(
            "Get Student Submission Details Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch submission details"
        });
    }
};

module.exports = {
    getStudentSubmissionDetails
};
