
const db = require("../../../../config/db");

// =====================================================
// START A LOGIC TO CODE ATTEMPT
// =====================================================

const startCodeLogicAttempt = async (req, res) => {
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

        // Confirm the problem is available.
        const [problems] = await connection.execute(
            `SELECT id, max_marks
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

        // Reuse the student's existing active attempt.
        const [existingAttempts] = await connection.execute(
            `SELECT id, attempt_number, started_at
             FROM code_logic_attempts
             WHERE student_id = ?
               AND problem_id = ?
               AND status = 'in_progress'
             ORDER BY attempt_number DESC
             LIMIT 1
             FOR UPDATE`,
            [studentId, problemId]
        );

        if (existingAttempts.length > 0) {
            await connection.commit();
            transactionStarted = false;

            return res.status(200).json({
                success: true,
                message: "Resuming existing attempt.",
                attempt: existingAttempts[0]
            });
        }

        // Find the next attempt number.
        const [numberRows] = await connection.execute(
            `SELECT COALESCE(MAX(attempt_number), 0) + 1
                AS next_attempt
             FROM code_logic_attempts
             WHERE student_id = ?
               AND problem_id = ?`,
            [studentId, problemId]
        );

        const attemptNumber = numberRows[0].next_attempt;

        // Create the new in-progress attempt.
        const [insertResult] = await connection.execute(
            `INSERT INTO code_logic_attempts (
                problem_id,
                student_id,
                attempt_number,
                score,
                max_marks,
                hints_used,
                time_taken_seconds,
                status,
                is_correct
            ) VALUES (?, ?, ?, 0, ?, 0, 0, 'in_progress', 0)`,
            [
                problemId,
                studentId,
                attemptNumber,
                problems[0].max_marks
            ]
        );

        // Create or update the progress summary.
        await connection.execute(
            `INSERT INTO code_logic_progress (
                student_id,
                problem_id,
                status,
                attempt_count
            ) VALUES (?, ?, 'in_progress', 0)
            ON DUPLICATE KEY UPDATE
                status = IF(status = 'completed', 'completed', 'in_progress')`,
            [studentId, problemId]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            success: true,
            message: "Attempt started successfully.",
            attempt: {
                id: insertResult.insertId,
                problemId,
                attemptNumber,
                status: "in_progress"
            }
        });

    } catch (error) {
        if (connection && transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Start attempt rollback error:", rollbackError);
            }
        }

        console.error("Start Logic to Code attempt error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to start the attempt."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    startCodeLogicAttempt
};
