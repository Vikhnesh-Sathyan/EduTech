
const db = require("../../../../config/db");

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

        // VALIDATE PROBLEM ID

        if (
            !Number.isInteger(problemId) ||
            problemId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid problem ID is required"
            });
        }

        // VALIDATE LANGUAGE

        const allowedLanguages = [
            "python",
            "javascript",
            "java"
        ];

        if (!allowedLanguages.includes(language)) {
            return res.status(400).json({
                success: false,
                message: "Unsupported programming language"
            });
        }

        // VALIDATE SOURCE CODE

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

        // START TRANSACTION

        await connection.beginTransaction();

        transactionStarted = true;

        // CHECK PUBLISHED PROBLEM

       const [problems] = await connection.query(
    `SELECT id
     FROM logic_to_code_problems
     WHERE id = ?
     AND status = 'published'
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

        // GENERATE NEXT SUBMISSION NUMBER

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

        // INSERT SUBMISSION

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

        // COMMIT TRANSACTION

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

        // ROLLBACK ONLY IF TRANSACTION STARTED

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
