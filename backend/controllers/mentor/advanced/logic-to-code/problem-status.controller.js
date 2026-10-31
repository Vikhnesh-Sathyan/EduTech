
const db = require("../../../../config/db");

// =====================================================
// UPDATE PROBLEM STATUS
// =====================================================

const updateProblemStatus = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        connection = await db.getConnection();

        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);
        const { status } = req.body;

        // Validate problem ID
        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
            });
        }

        // Validate status
        const allowedStatuses = [
            "draft",
            "published",
            "archived"
        ];

        if (
            typeof status !== "string" ||
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem status."
            });
        }

        await connection.beginTransaction();
        transactionStarted = true;

        // Lock problem row and verify mentor ownership
        const [problems] = await connection.query(
            `SELECT id, status
             FROM logic_to_code_problems
             WHERE id = ? AND mentor_id = ?
             FOR UPDATE`,
            [problemId, mentorId]
        );

        if (problems.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Problem not found."
            });
        }

        // Validate test cases before publishing
        if (status === "published") {
            const [testCases] = await connection.query(
                `SELECT
                    SUM(visibility = 'public') AS publicCases,
                    SUM(visibility = 'hidden') AS hiddenCases
                 FROM logic_to_code_test_cases
                 WHERE problem_id = ?`,
                [problemId]
            );

            const publicCases = Number(
                testCases[0].publicCases || 0
            );

            const hiddenCases = Number(
                testCases[0].hiddenCases || 0
            );

            if (publicCases < 1 || hiddenCases < 1) {
                await connection.rollback();
                transactionStarted = false;

                return res.status(400).json({
                    success: false,
                    message: "Add at least one public and one hidden test case before publishing."
                });
            }
        }

        // Update problem status
        await connection.query(
            `UPDATE logic_to_code_problems
             SET status = ?
             WHERE id = ? AND mentor_id = ?`,
            [status, problemId, mentorId]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            success: true,
            message: `Problem ${status} successfully.`,
            status
        });

    } catch (error) {
        if (transactionStarted && connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Status Update Rollback Error:", rollbackError);
            }
        }

        console.error("Update Problem Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    updateProblemStatus
};
