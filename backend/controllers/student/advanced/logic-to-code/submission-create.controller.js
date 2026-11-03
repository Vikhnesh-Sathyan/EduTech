
const db = require("../../../../config/db");

const {
    getLanguageFromSubject
} = require("../../../../config/logicToCodeProgrammingLanguages");

// =====================================================
// CREATE STUDENT CODE SUBMISSION
// =====================================================

const createStudentSubmission = async (req, res) => {

    const connection = await db.getConnection();

    let transactionStarted = false;

    try {

        const studentId = req.user.id;
        const problemId = Number(req.params.problemId);

        const { language, source_code } = req.body;

        // 1. VALIDATE PROBLEM ID

        if (
            !Number.isInteger(problemId) ||
            problemId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid problem ID is required"
            });
        }

        // 2. VALIDATE SOURCE CODE

        if (
            typeof source_code !== "string" ||
            !source_code.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Source code is required"
            });
        }

        if (source_code.length > 50000) {
            return res.status(400).json({
                success: false,
                message: "Source code is too large"
            });
        }

        // 3. START TRANSACTION

        await connection.beginTransaction();

        transactionStarted = true;

        // 4. GET PUBLISHED PROBLEM AND SUBJECT

        const [problems] = await connection.query(
            `SELECT
                p.id,
                p.subject_id,
                s.name AS subject_name
             FROM logic_to_code_problems p
             INNER JOIN subjects s
                ON p.subject_id = s.id
             WHERE p.id = ?
             AND p.status = 'published'
             FOR UPDATE`,
            [problemId]
        );

        if (problems.length === 0) {

            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Published problem not found"
            });
        }

        // 5. GET EXPECTED LANGUAGE FROM CENTRAL CONFIGURATION

        const expectedLanguage = getLanguageFromSubject(
            problems[0].subject_name
        );

        // 6. CHECK SUBJECT SUPPORT

        if (!expectedLanguage) {

            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: `No supported programming language configured for subject: ${problems[0].subject_name}`
            });
        }

        // 7. VALIDATE SUBMITTED LANGUAGE

        if (
            typeof language !== "string" ||
            language !== expectedLanguage.executionLanguage
        ) {

            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: `This problem requires ${expectedLanguage.label}.`
            });
        }

        // 8. GENERATE NEXT SUBMISSION NUMBER

        const [previousSubmissions] = await connection.query(
            `SELECT COALESCE(MAX(submission_number), 0) AS lastNumber
             FROM logic_to_code_submissions
             WHERE problem_id = ?
             AND student_id = ?
             FOR UPDATE`,
            [problemId, studentId]
        );

        const submissionNumber =
            Number(previousSubmissions[0].lastNumber) + 1;

        // 9. INSERT SUBMISSION

        const [result] = await connection.query(
            `INSERT INTO logic_to_code_submissions
             (
                problem_id,
                student_id,
                language,
                source_code,
                submission_number,
                execution_status,
                passed_test_cases,
                total_test_cases
             )
             VALUES (?, ?, ?, ?, ?, 'pending', 0, 0)`,
            [
                problemId,
                studentId,
                language,
                source_code,
                submissionNumber
            ]
        );

        // 10. COMMIT TRANSACTION

        await connection.commit();

        transactionStarted = false;

        return res.status(201).json({
            success: true,
            message: "Code submission created successfully",
            data: {
                submissionId: result.insertId,
                problemId,
                language,
                submissionNumber,
                executionStatus: "pending"
            }
        });

    } catch (error) {

        if (transactionStarted) {

            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Submission Rollback Error:",
                    rollbackError.message
                );
            }
        }

        console.error(
            "Create Student Submission Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create code submission"
        });

    } finally {

        connection.release();

    }
};

module.exports = {
    createStudentSubmission
};
