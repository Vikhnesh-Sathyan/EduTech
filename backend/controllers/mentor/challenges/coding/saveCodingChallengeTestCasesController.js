
const db = require("../../../../config/db");

// ==========================================
// SAVE CODING CHALLENGE TEST CASES
// ==========================================

const saveCodingChallengeTestCases = async (req, res) => {
    let connection;

    try {
        const mentorId = req.user.id;
        const challenge_id = req.params.challengeId;
        const { test_cases } = req.body;

        // VALIDATE INPUT

        if (!challenge_id || !Array.isArray(test_cases) || test_cases.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Challenge ID and test cases are required"
            });
        }

        for (const testCase of test_cases) {
            if (
                !testCase ||
                typeof testCase.input_data !== "object" ||
                testCase.input_data === null ||
                typeof testCase.expected_output === "undefined"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Each test case must contain valid input data and expected output"
                });
            }
        }

        // VERIFY CHALLENGE OWNERSHIP

        const [challenges] = await db.query(
            `
            SELECT id
            FROM coding_challenges
            WHERE id = ?
              AND created_by = ?
            LIMIT 1
            `,
            [challenge_id, mentorId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Coding challenge not found"
            });
        }

        // SAVE TEST CASES USING TRANSACTION

        connection = await db.getConnection();

        await connection.beginTransaction();

        for (const testCase of test_cases) {
            await connection.query(
                `
                INSERT INTO coding_challenge_test_cases
                (
                    challenge_id,
                    input_data,
                    expected_output,
                    is_hidden
                )
                VALUES (?, ?, ?, TRUE)
                `,
                [
                    challenge_id,
                    JSON.stringify(testCase.input_data),
                    JSON.stringify(testCase.expected_output)
                ]
            );
        }

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Test cases saved successfully",
            total: test_cases.length
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Save Coding Challenge Test Cases Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save test cases"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    saveCodingChallengeTestCases
};
