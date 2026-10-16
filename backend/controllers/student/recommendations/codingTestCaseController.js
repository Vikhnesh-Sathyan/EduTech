const db = require("../../../config/db");

// ==========================================
// CREATE CODE TEST CASES
// ==========================================

const createCodeTestCases = async (req, res) => {
    try {
        const solutionId = Number(req.params.solutionId);
const { test_cases } = req.body;

if (!Number.isInteger(solutionId) || solutionId <= 0) {
    return res.status(400).json({
        message: "Invalid solution ID."
    });
}

        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can add test cases."
            });
        }

        if (
            !Array.isArray(test_cases) ||
            test_cases.length === 0
        ) {
            return res.status(400).json({
                message: "Provide at least one test case."
            });
        }

        if (test_cases.length > 50) {
            return res.status(400).json({
                message: "You can add a maximum of 50 test cases at once."
            });
        }

        for (const testCase of test_cases) {
            if (
                typeof testCase.input_data !== "string" ||
                typeof testCase.expected_output !== "string"
            ) {
                return res.status(400).json({
                    message: "Each test case must include input_data and expected_output as strings."
                });
            }

            if (
                testCase.test_name != null &&
                typeof testCase.test_name !== "string"
            ) {
                return res.status(400).json({
                    message: "test_name must be a string."
                });
            }

            if (
                testCase.explanation != null &&
                typeof testCase.explanation !== "string"
            ) {
                return res.status(400).json({
                    message: "explanation must be a string."
                });
            }
        }

        const [solutions] = await db.query(
            `SELECT
                cs.id,
                cs.student_id,
                scp.student_id AS post_owner_id,
                scp.status AS post_status,
                s.status AS subject_status
             FROM student_code_solutions cs
             INNER JOIN student_code_posts scp
                ON scp.id = cs.post_id
             INNER JOIN subjects s
                ON s.id = scp.subject_id
             WHERE cs.id = ?`,
            [solutionId]
        );

        if (solutions.length === 0) {
            return res.status(404).json({
                message: "Code solution not found."
            });
        }

        const solution = solutions[0];

        // Only the solution author can add test cases.
        if (Number(solution.student_id) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "You can only add test cases to your own solution."
            });
        }

        if (
            solution.post_status !== "published" ||
            solution.subject_status !== "active"
        ) {
            return res.status(400).json({
                message: "Test cases cannot be added to this unpublished or inactive question."
            });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [existingCases] = await connection.query(
                `SELECT COALESCE(MAX(display_order), 0) AS max_order
                 FROM student_code_test_cases
                 WHERE solution_id = ?`,
                [solutionId]
            );

            let displayOrder = Number(existingCases[0].max_order) + 1;

            for (const testCase of test_cases) {
                await connection.query(
                    `INSERT INTO student_code_test_cases
                    (
                        solution_id,
                        test_name,
                        input_data,
                        expected_output,
                        explanation,
                        is_sample,
                        display_order
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        solutionId,
                        testCase.test_name?.trim() || null,
                        testCase.input_data,
                        testCase.expected_output,
                        testCase.explanation?.trim() || null,
                        testCase.is_sample === false ? 0 : 1,
                        displayOrder++
                    ]
                );
            }

            await connection.commit();

            return res.status(201).json({
                message: "Test cases created successfully.",
                total_created: test_cases.length
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Create code test cases error:", error);

        return res.status(500).json({
            message: "Failed to create test cases."
        });
    }
};

// ==========================================
// GET CODE TEST CASES
// ==========================================

const getCodeTestCases = async (req, res) => {
    try {
        const solutionId = Number(req.params.solutionId);

if (!Number.isInteger(solutionId) || solutionId <= 0) {
    return res.status(400).json({
        message: "Invalid solution ID."
    });
}

        const [solutions] = await db.query(
            `SELECT
                cs.id,
                cs.student_id,
                scp.status AS post_status,
                s.status AS subject_status
             FROM student_code_solutions cs
             INNER JOIN student_code_posts scp
                ON scp.id = cs.post_id
             INNER JOIN subjects s
                ON s.id = scp.subject_id
             WHERE cs.id = ?`,
            [solutionId]
        );

        if (solutions.length === 0) {
            return res.status(404).json({
                message: "Code solution not found."
            });
        }

        const solution = solutions[0];

        const isOwner =
            req.user.role === "student" &&
            Number(solution.student_id) === Number(req.user.id);

        if (
            (
                solution.post_status !== "published" ||
                solution.subject_status !== "active"
            ) &&
            !isOwner
        ) {
            return res.status(404).json({
                message: "Code solution not found."
            });
        }

        const [testCases] = await db.query(
            `SELECT
                id,
                solution_id,
                test_name,
                input_data,
                expected_output,
                explanation,
                is_sample,
                display_order,
                created_at,
                updated_at
             FROM student_code_test_cases
             WHERE solution_id = ?
             ORDER BY display_order ASC, id ASC`,
            [solutionId]
        );

        return res.status(200).json({
            message: "Test cases retrieved successfully.",
            solution_id: Number(solutionId),
            total_test_cases: testCases.length,
            test_cases: testCases
        });
    } catch (error) {
        console.error("Get code test cases error:", error);

        return res.status(500).json({
            message: "Failed to retrieve test cases."
        });
    }
};

module.exports = {
    createCodeTestCases,
    getCodeTestCases
};