
const db = require("../../../../config/db");

const {
    executeCode
} = require("../../../../services/jdoodleService");

const {
    classifyExecutionResult
} = require("../../../../utils/logic-to-code/execution-result.util");

const {
    getLanguageFromSubject
} = require("../../../../config/logicToCodeProgrammingLanguages");

// ==========================================
// PARSE JSON SAFELY
// ==========================================

const parseJsonIfPossible = (value) => {

    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

// ==========================================
// NORMALIZE OUTPUT FOR COMPARISON
// ==========================================

const normalizeOutput = (value) => {

    const sortObject = (data) => {

        if (Array.isArray(data)) {
            return data.map(sortObject);
        }

        if (data && typeof data === "object") {

            return Object.keys(data)
                .sort()
                .reduce((result, key) => {
                    result[key] = sortObject(data[key]);
                    return result;
                }, {});
        }

        return data;
    };

    if (typeof value !== "string") {
        return JSON.stringify(sortObject(value));
    }

    const trimmed = value.trim();

    try {
        const parsed = JSON.parse(trimmed);
        return JSON.stringify(sortObject(parsed));
    } catch {
        return trimmed;
    }
};

// ==========================================
// EXECUTE STUDENT CODING CHALLENGE ATTEMPT
// ==========================================

const executeStudentCodingChallengeAttempt = async (req, res) => {

    const studentId = req.user.id;
    const { attemptId } = req.params;

    let executionStarted = false;

    try {

        // VALIDATE ATTEMPT ID

        if (
            !attemptId ||
            !Number.isInteger(Number(attemptId)) ||
            Number(attemptId) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid attempt ID is required"
            });
        }

        // GET STUDENT ATTEMPT

        const [attempts] = await db.query(
            `
            SELECT
                cca.id AS attempt_id,
                cca.student_id,
                cca.challenge_id,
                cca.submitted_content,
                cca.result_status,

                cct.type_key AS challenge_type_key,

                s.name AS subject_name

            FROM coding_challenge_attempts cca

            INNER JOIN coding_challenges cc
                ON cc.id = cca.challenge_id

            INNER JOIN coding_challenge_types cct
                ON cct.id = cc.challenge_type_id

            INNER JOIN subjects s
                ON s.id = cc.subject_id

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

        const attempt = attempts[0];

        // CHECK CHALLENGE TYPE

        if (attempt.challenge_type_key !== "bug_finder") {
            return res.status(400).json({
                success: false,
                message: "This evaluator only supports Bug Finder challenges"
            });
        }

        // CHECK SUBMISSION STATUS

        if (attempt.result_status !== "pending") {
            return res.status(409).json({
                success: false,
                message: "This attempt is already being evaluated or has been evaluated"
            });
        }

        // READ SUBMITTED CONTENT

        const submittedContent = parseJsonIfPossible(
            attempt.submitted_content
        );

        if (
            !submittedContent ||
            typeof submittedContent !== "object" ||
            Array.isArray(submittedContent)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid submitted content"
            });
        }

        const sourceCode = submittedContent.source_code;

        if (
            typeof sourceCode !== "string" ||
            !sourceCode.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Complete corrected source code is required"
            });
        }

        // GET PROGRAMMING LANGUAGE

        const languageConfig = getLanguageFromSubject(
            attempt.subject_name
        );

        if (!languageConfig) {
            return res.status(400).json({
                success: false,
                message: "Programming language is not supported for this subject"
            });
        }

        // GET TEST CASES

        const [testCases] = await db.query(
            `
            SELECT
                id,
                input_data,
                expected_output

            FROM coding_challenge_test_cases

            WHERE challenge_id = ?

            ORDER BY id ASC
            `,
            [attempt.challenge_id]
        );

        if (testCases.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No test cases are configured for this challenge"
            });
        }

        // CLAIM ATTEMPT FOR EXECUTION

        const [claimResult] = await db.query(
            `
            UPDATE coding_challenge_attempts

            SET result_status = 'running'

            WHERE id = ?
              AND student_id = ?
              AND result_status = 'pending'
            `,
            [attemptId, studentId]
        );

        if (claimResult.affectedRows === 0) {
            return res.status(409).json({
                success: false,
                message: "This attempt is already being evaluated"
            });
        }

        executionStarted = true;

        // ==========================================
        // EXECUTE TEST CASES
        // ==========================================

        let passedCount = 0;
        let failureStatus = null;
        let failedCaseNumber = null;

        for (let index = 0; index < testCases.length; index++) {

            const testCase = testCases[index];

            const inputData = parseJsonIfPossible(
                testCase.input_data
            );

            const expectedOutput = parseJsonIfPossible(
                testCase.expected_output
            );

            const stdin = JSON.stringify(inputData);

            const executionResult = await executeCode(
                sourceCode,
                languageConfig.executionLanguage,
                stdin
            );

            const classifiedResult = classifyExecutionResult(
                languageConfig.executionLanguage,
                executionResult
            );

            // INTERNAL ERROR SHOULD NOT CONSUME AN ATTEMPT

            if (classifiedResult.status === "internal_error") {
                throw new Error("JDoodle execution failed internally");
            }

            // HANDLE STUDENT CODE ERRORS

            if (classifiedResult.status !== "success") {

                failureStatus = classifiedResult.status;
                failedCaseNumber = index + 1;

                break;
            }

            // COMPARE ACTUAL AND EXPECTED OUTPUT

            const actualOutput = normalizeOutput(
                classifiedResult.output
            );

            const expected = normalizeOutput(
                expectedOutput
            );

            if (actualOutput === expected) {

                passedCount++;

            } else {

                failureStatus = "wrong_answer";
                failedCaseNumber = index + 1;

                break;
            }
        }

        // ==========================================
        // CALCULATE SCORE
        // ==========================================

        const totalCases = testCases.length;

        const score = Number(
            ((passedCount / totalCases) * 100).toFixed(2)
        );

        const allPassed = passedCount === totalCases;

        const finalStatus = allPassed
            ? "completed"
            : "evaluated";

        // ==========================================
        // PREPARE FEEDBACK
        // ==========================================

        let feedback;

        if (allPassed) {

            feedback =
                "Excellent! All hidden test cases passed. Challenge completed.";

        } else if (failureStatus === "compilation_error") {

            feedback =
                `Compilation error detected during Test Case ${failedCaseNumber}. Please correct your code and try again.`;

        } else if (failureStatus === "runtime_error") {

            feedback =
                `Runtime error detected during Test Case ${failedCaseNumber}. Please check your code and try again.`;

        } else {

            feedback =
                `Your code passed ${passedCount} out of ${totalCases} test cases. Please review your solution and try again.`;
        }

        // ==========================================
        // SAVE EVALUATION RESULT
        // ==========================================

        const [updateResult] = await db.query(
            `
            UPDATE coding_challenge_attempts

            SET
                score = ?,
                result_status = ?,
                feedback = ?,
                evaluated_at = NOW()

            WHERE id = ?
              AND student_id = ?
              AND result_status = 'running'
            `,
            [
                score,
                finalStatus,
                feedback,
                attemptId,
                studentId
            ]
        );

        if (updateResult.affectedRows === 0) {
            throw new Error("Failed to save Coding Challenge evaluation");
        }

        executionStarted = false;

        // ==========================================
        // SEND SAFE RESULT TO STUDENT
        // ==========================================

        return res.status(200).json({

            success: true,

            message: allPassed
                ? "Congratulations! Challenge completed."
                : "Evaluation completed. You can try again.",

            result: {
                attemptId: Number(attemptId),
                score,
                passedTestCases: passedCount,
                totalTestCases: totalCases,
                resultStatus: finalStatus,
                feedback
            }

        });

    } catch (error) {

        console.error(
            "Coding Challenge Execution Error:",
            error
        );

        // RESET ATTEMPT AFTER INTERNAL FAILURE

        if (executionStarted) {

            try {

                await db.query(
                    `
                    UPDATE coding_challenge_attempts

                    SET result_status = 'pending'

                    WHERE id = ?
                      AND student_id = ?
                      AND result_status = 'running'
                    `,
                    [attemptId, studentId]
                );

            } catch (updateError) {

                console.error(
                    "Failed to reset Coding Challenge attempt:",
                    updateError
                );
            }
        }

        return res.status(500).json({
            success: false,
            message: "Failed to execute Coding Challenge. Please try again."
        });
    }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    executeStudentCodingChallengeAttempt
};
