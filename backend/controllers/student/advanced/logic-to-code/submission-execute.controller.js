
const db = require("../../../../config/db");

const {
    executeCode
} = require("../../../../services/jdoodleService");

const {
    classifyExecutionResult
} = require("../../../../utils/logic-to-code/execution-result.util");

// =====================================================
// EXECUTE STUDENT SUBMISSION
// =====================================================

const executeStudentSubmission = async (req, res) => {

    let submissionId;
    let studentId;
    let executionStarted = false;

    try {

        studentId = req.user.id;
        submissionId = Number(req.params.submissionId);

        // VALIDATE SUBMISSION ID

        if (
            !Number.isInteger(submissionId) ||
            submissionId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid submission ID is required"
            });
        }

        // GET STUDENT SUBMISSION AND PROBLEM STATUS

        const [submissions] = await db.query(
            `SELECT
                s.id,
                s.problem_id,
                s.language,
                s.source_code,
                s.execution_status,
                p.status AS problem_status
             FROM logic_to_code_submissions s
             INNER JOIN logic_to_code_problems p
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

        const submission = submissions[0];

        // CHECK PROBLEM STATUS

        if (submission.problem_status !== "published") {
            return res.status(403).json({
                success: false,
                message: "This problem is no longer available for execution"
            });
        }

        // CHECK SUBMISSION STATUS

        if (submission.execution_status !== "pending") {
            return res.status(409).json({
                success: false,
                message: "This submission has already been processed"
            });
        }

        // GET TEST CASES

        const [testCases] = await db.query(
            `SELECT
                case_number,
                test_input,
                expected_output,
                visibility
             FROM logic_to_code_test_cases
             WHERE problem_id = ?
             ORDER BY case_number ASC`,
            [submission.problem_id]
        );

        if (testCases.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No test cases are available for this problem"
            });
        }

        // ATOMICALLY MARK SUBMISSION AS RUNNING
        // RECHECK PROBLEM STATUS BEFORE EXECUTION

        const [updateResult] = await db.query(
            `UPDATE logic_to_code_submissions
             SET execution_status = 'running',
                 total_test_cases = ?
             WHERE id = ?
             AND student_id = ?
             AND execution_status = 'pending'
             AND EXISTS (
                 SELECT 1
                 FROM logic_to_code_problems
                 WHERE id = logic_to_code_submissions.problem_id
                 AND status = 'published'
             )`,
            [
                testCases.length,
                submissionId,
                studentId
            ]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(409).json({
                success: false,
                message: "Submission is already being processed or the problem is no longer published"
            });
        }

        executionStarted = true;

        // EXECUTE TEST CASES

        let passedCount = 0;
        let totalExecutionTime = 0;
        let totalMemory = 0;

        let finalStatus = "accepted";
        let errorMessage = null;

        const testResults = [];

        for (const testCase of testCases) {

            const result = await executeCode(
                submission.source_code,
                submission.language,
                testCase.test_input
            );

            // CLASSIFY EXECUTION RESULT

            const executionResult = classifyExecutionResult(
                submission.language,
                result
            );

            totalExecutionTime += Number(
                result.cpuTime || 0
            );

            totalMemory = Math.max(
                totalMemory,
                Number(result.memory || 0)
            );

            // HANDLE JDOODLE FAILURE

            if (executionResult.status === "internal_error") {
                throw new Error(
                    "Invalid JDoodle execution response."
                );
            }

            // HANDLE COMPILATION ERROR

            if (
                executionResult.status === "compilation_error"
            ) {
                finalStatus = "compilation_error";
                errorMessage = "Compilation error in submitted code.";

                testResults.push({
                    caseNumber: testCase.case_number,
                    visibility: testCase.visibility,
                    passed: false
                });

                break;
            }

            // HANDLE RUNTIME ERROR

            if (
                executionResult.status === "runtime_error"
            ) {
                finalStatus = "runtime_error";
                errorMessage = "Runtime error while executing submitted code.";

                testResults.push({
                    caseNumber: testCase.case_number,
                    visibility: testCase.visibility,
                    passed: false
                });

                break;
            }

            // COMPARE OUTPUTS

            const actualOutput = String(
                executionResult.output || ""
            ).trim();

            const expectedOutput = String(
                testCase.expected_output || ""
            ).trim();

            const passed = actualOutput === expectedOutput;

            if (passed) {
                passedCount++;
            }

            testResults.push({
                caseNumber: testCase.case_number,
                visibility: testCase.visibility,
                passed
            });

            if (!passed) {
                finalStatus = "wrong_answer";
            }
        }

        // UPDATE FINAL SUBMISSION RESULT

        await db.query(
            `UPDATE logic_to_code_submissions
             SET execution_status = ?,
                 passed_test_cases = ?,
                 total_test_cases = ?,
                 execution_time_ms = ?,
                 memory_used_kb = ?,
                 error_message = ?,
                 test_results = ?
             WHERE id = ?
             AND student_id = ?`,
            [
                finalStatus,
                passedCount,
                testCases.length,
                Math.round(totalExecutionTime * 1000),
                totalMemory,
                errorMessage,
                JSON.stringify(testResults),
                submissionId,
                studentId
            ]
        );

        executionStarted = false;

        return res.status(200).json({
            success: true,
            message: "Code execution completed",
            data: {
                submissionId,
                executionStatus: finalStatus,
                passedTestCases: passedCount,
                totalTestCases: testCases.length,
                testResults
            }
        });

    } catch (error) {

        console.error(
            "Execute Student Submission Error:",
            error.message
        );

        // PREVENT SUBMISSION FROM REMAINING RUNNING

        if (executionStarted) {

            try {

                await db.query(
                    `UPDATE logic_to_code_submissions
                     SET execution_status = 'internal_error',
                         error_message = ?
                     WHERE id = ?
                     AND student_id = ?
                     AND execution_status = 'running'`,
                    [
                        "Code execution service is temporarily unavailable.",
                        submissionId,
                        studentId
                    ]
                );

            } catch (updateError) {

                console.error(
                    "Failed to update submission status:",
                    updateError.message
                );
            }
        }

        return res.status(500).json({
            success: false,
            message: "Code execution failed. Please try again later."
        });
    }
};

module.exports = {
    executeStudentSubmission
};
