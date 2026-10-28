
const db = require("../../../../config/db");

// =====================================================
// GET A HINT FOR AN ACTIVE LOGIC TO CODE ATTEMPT
// =====================================================

const getCodeLogicHint = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const studentId = Number(req.user?.id);
        const problemId = Number(req.params.problemId);

        if (
            !Number.isInteger(studentId) ||
            studentId <= 0 ||
            !Number.isInteger(problemId) ||
            problemId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid student or problem ID."
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();
        transactionStarted = true;

        // Get the available problem's hint.
        const [problems] = await connection.execute(
            `SELECT hint_text
             FROM code_logic_problems
             WHERE id = ?
               AND status = 'published'
               AND (publish_date IS NULL OR publish_date <= NOW())
               AND (due_date IS NULL OR due_date >= NOW())
             FOR UPDATE`,
            [problemId]
        );

        if (problems.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Published problem not found or unavailable."
            });
        }

        if (
            typeof problems[0].hint_text !== "string" ||
            problems[0].hint_text.trim() === ""
        ) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "No hint is available for this problem."
            });
        }

        // Lock the student's active attempt.
        const [attempts] = await connection.execute(
            `SELECT id, hints_used
             FROM code_logic_attempts
             WHERE student_id = ?
               AND problem_id = ?
               AND status = 'in_progress'
             ORDER BY attempt_number DESC
             LIMIT 1
             FOR UPDATE`,
            [studentId, problemId]
        );

        if (attempts.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(409).json({
                success: false,
                message: "Start an attempt before requesting a hint."
            });
        }

        const attempt = attempts[0];

        await connection.execute(
            `UPDATE code_logic_attempts
             SET hints_used = hints_used + 1
             WHERE id = ?
               AND student_id = ?
               AND status = 'in_progress'`,
            [attempt.id, studentId]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            success: true,
            message: "Hint retrieved successfully.",
            hint: problems[0].hint_text,
            hintsUsed: attempt.hints_used + 1
        });

    } catch (error) {
        if (connection && transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Hint rollback error:",
                    rollbackError
                );
            }
        }

        console.error("Get Logic to Code hint error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve the hint."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    getCodeLogicHint
};
