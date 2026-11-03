
const db = require("../../../../config/db");

// =====================================================
// GET STUDENT SUBMISSION DETAILS
// =====================================================

const getStudentSubmissionDetails = async (req, res) => {
    try {
        const studentId = req.user.id;
        const submissionId = Number(req.params.submissionId);

        // -------------------------------------------------
        // VALIDATE SUBMISSION ID
        // -------------------------------------------------

        if (
            !Number.isSafeInteger(submissionId) ||
            submissionId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid submission ID is required"
            });
        }

        // -------------------------------------------------
        // FETCH STUDENT SUBMISSION
        // -------------------------------------------------

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
                s.star_rating,
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

        // -------------------------------------------------
        // CHECK SUBMISSION EXISTS
        // -------------------------------------------------

        if (submissions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        const submission = submissions[0];

        // -------------------------------------------------
        // PARSE TEST RESULTS
        // -------------------------------------------------

        let testResults = [];

        try {
            testResults =
                typeof submission.test_results === "string"
                    ? JSON.parse(submission.test_results)
                    : submission.test_results || [];

            if (!Array.isArray(testResults)) {
                testResults = [];
            }

        } catch (error) {
            console.error("Test Results Parsing Error:", error);
            testResults = [];
        }

        // -------------------------------------------------
        // FILTER PRIVATE TEST-CASE DETAILS
        // -------------------------------------------------

        const safeTestResults = testResults.map((test) => ({
            caseNumber: test.caseNumber,
            visibility: test.visibility,
            passed: test.passed
        }));

        // -------------------------------------------------
        // RETURN SAFE STUDENT RESPONSE
        // -------------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Submission details fetched successfully",

            data: {
                ...submission,
                test_results: safeTestResults
            }
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
