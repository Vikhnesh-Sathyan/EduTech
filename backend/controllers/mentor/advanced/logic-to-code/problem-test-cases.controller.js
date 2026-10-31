const db = require("../../../../config/db");

const {
    checkTestCaseModificationAccess
} = require("../../../../utils/logic-to-code/test-case-access.util");

// ==========================================
// ADD TEST CASE
// ==========================================


const addTestCase = async (req, res) => {
    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        const {
            test_input,
            expected_output,
            visibility
        } = req.body;

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
            });
        }

        if (
            typeof test_input !== "string" ||
            typeof expected_output !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Test input and expected output are required."
            });
        }

        const allowedVisibility = ["public", "hidden"];

        if (
            visibility &&
            !allowedVisibility.includes(visibility)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid test case visibility."
            });
        }

        await connection.beginTransaction();
        transactionStarted = true;

        // Check whether modification is allowed
        const access = await checkTestCaseModificationAccess(
            connection,
            problemId,
            mentorId
        );

        if (!access.allowed) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(access.statusCode).json({
                success: false,
                message: access.message
            });
        }

        // Generate next case number
        const [[numberResult]] = await connection.query(
            `SELECT COALESCE(MAX(case_number), 0) + 1 AS nextNumber
             FROM logic_to_code_test_cases
             WHERE problem_id = ?`,
            [problemId]
        );

        // Insert test case
        const [result] = await connection.query(
            `INSERT INTO logic_to_code_test_cases
             (problem_id, case_number, test_input, expected_output, visibility)
             VALUES (?, ?, ?, ?, ?)`,
            [
                problemId,
                numberResult.nextNumber,
                test_input,
                expected_output,
                visibility || "public"
            ]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            success: true,
            message: "Test case added successfully.",
            testCaseId: result.insertId,
            caseNumber: numberResult.nextNumber
        });

    } catch (error) {
        if (transactionStarted) {
            await connection.rollback();
        }

        console.error("Add Test Case Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });

    } finally {
        connection.release();
    }
};


// ==========================================
// GET TEST CASES
// ==========================================

const getTestCases = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
            });
        }

        const [problems] = await db.query(
            `SELECT id
             FROM logic_to_code_problems
             WHERE id = ? AND mentor_id = ?`,
            [problemId, mentorId]
        );

        if (problems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Problem not found."
            });
        }

        const [testCases] = await db.query(
            `SELECT id, problem_id, case_number,
                    test_input, expected_output, visibility
             FROM logic_to_code_test_cases
             WHERE problem_id = ?
             ORDER BY case_number ASC`,
            [problemId]
        );

        return res.status(200).json({
            success: true,
            totalTestCases: testCases.length,
            testCases
        });

    } catch (error) {
        console.error("Get Test Cases Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// ==========================================
// UPDATE TEST CASE
// ==========================================


const updateTestCase = async (req, res) => {
    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);
        const testCaseId = Number(req.params.testCaseId);

        const {
            test_input,
            expected_output,
            visibility
        } = req.body;

        if (
            !Number.isInteger(problemId) ||
            problemId <= 0 ||
            !Number.isInteger(testCaseId) ||
            testCaseId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem or test case ID."
            });
        }

        if (
            typeof test_input !== "string" ||
            typeof expected_output !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Test input and expected output are required."
            });
        }

        const allowedVisibility = ["public", "hidden"];

        if (
            visibility &&
            !allowedVisibility.includes(visibility)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid test case visibility."
            });
        }

        await connection.beginTransaction();
        transactionStarted = true;

        // Check modification access
        const access = await checkTestCaseModificationAccess(
            connection,
            problemId,
            mentorId
        );

        if (!access.allowed) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(access.statusCode).json({
                success: false,
                message: access.message
            });
        }

        // Update test case
        const [result] = await connection.query(
            `UPDATE logic_to_code_test_cases
             SET test_input = ?,
                 expected_output = ?,
                 visibility = ?
             WHERE id = ? AND problem_id = ?`,
            [
                test_input,
                expected_output,
                visibility || "public",
                testCaseId,
                problemId
            ]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Test case not found."
            });
        }

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            success: true,
            message: "Test case updated successfully."
        });

    } catch (error) {
        if (transactionStarted) {
            await connection.rollback();
        }

        console.error("Update Test Case Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });

    } finally {
        connection.release();
    }
};


// ==========================================
// DELETE TEST CASE
// ==========================================


const deleteTestCase = async (req, res) => {
    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);
        const testCaseId = Number(req.params.testCaseId);

        if (
            !Number.isInteger(problemId) ||
            problemId <= 0 ||
            !Number.isInteger(testCaseId) ||
            testCaseId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem or test case ID."
            });
        }

        await connection.beginTransaction();
        transactionStarted = true;

        // Check modification access
        const access = await checkTestCaseModificationAccess(
            connection,
            problemId,
            mentorId
        );

        if (!access.allowed) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(access.statusCode).json({
                success: false,
                message: access.message
            });
        }

        // Delete test case
        const [result] = await connection.query(
            `DELETE FROM logic_to_code_test_cases
             WHERE id = ? AND problem_id = ?`,
            [testCaseId, problemId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Test case not found."
            });
        }

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            success: true,
            message: "Test case deleted successfully."
        });

    } catch (error) {
        if (transactionStarted) {
            await connection.rollback();
        }

        console.error("Delete Test Case Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });

    } finally {
        connection.release();
    }
};


module.exports = {
    addTestCase,
    getTestCases,
    updateTestCase,
    deleteTestCase
};
