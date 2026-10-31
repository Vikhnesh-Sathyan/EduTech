
const db = require("../../../../config/db");

// =====================================================
// GET PUBLIC TEST CASES
// =====================================================

const getPublicTestCases = async (req, res) => {

    try {

        const problemId = Number(req.params.problemId);

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

        // CHECK WHETHER PROBLEM IS PUBLISHED

        const [problems] = await db.query(
            `SELECT id
             FROM logic_to_code_problems
             WHERE id = ?
             AND status = 'published'`,
            [problemId]
        );

        if (problems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Published problem not found"
            });
        }

        // FETCH PUBLIC TEST CASES ONLY

        const [testCases] = await db.query(
            `SELECT
                case_number,
                test_input,
                expected_output
             FROM logic_to_code_test_cases
             WHERE problem_id = ?
             AND visibility = 'public'
             ORDER BY case_number ASC`,
            [problemId]
        );

        return res.status(200).json({
            success: true,
            count: testCases.length,
            testCases
        });

    } catch (error) {

        console.error(
            "Get Public Test Cases Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve public test cases"
        });
    }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getPublicTestCases
};
