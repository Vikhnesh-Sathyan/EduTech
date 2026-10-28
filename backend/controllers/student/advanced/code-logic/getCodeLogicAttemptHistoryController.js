
const db = require("../../../../config/db");

// =====================================================
// GET LOGGED-IN STUDENT'S ATTEMPT HISTORY
// =====================================================

const getCodeLogicAttemptHistory = async (req, res) => {
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

        // Confirm that the problem exists.
        const [problems] = await db.execute(
            `SELECT id, title, max_marks
             FROM code_logic_problems
             WHERE id = ?`,
            [problemId]
        );

        if (problems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Problem not found."
            });
        }

        // Fetch only this student's attempts.
        const [attempts] = await db.execute(
            `SELECT
                id,
                attempt_number,
                score,
                max_marks,
                hints_used,
                time_taken_seconds,
                status,
                is_correct,
                started_at,
                submitted_at
             FROM code_logic_attempts
             WHERE student_id = ?
               AND problem_id = ?
             ORDER BY attempt_number DESC`,
            [studentId, problemId]
        );

        // Fetch this student's progress summary.
        const [progressRows] = await db.execute(
            `SELECT
                status,
                first_score,
                latest_score,
                best_score,
                attempt_count,
                first_attempt_at,
                last_attempt_at,
                completed_at
             FROM code_logic_progress
             WHERE student_id = ?
               AND problem_id = ?
             LIMIT 1`,
            [studentId, problemId]
        );

        return res.status(200).json({
            success: true,
            problem: problems[0],
            attemptCount: attempts.length,
            attempts,
            progress: progressRows[0] || {
                status: "not_started",
                first_score: null,
                latest_score: null,
                best_score: null,
                attempt_count: 0,
                first_attempt_at: null,
                last_attempt_at: null,
                completed_at: null
            }
        });

    } catch (error) {
        console.error(
            "Get Logic to Code attempt history error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch attempt history."
        });
    }
};

module.exports = {
    getCodeLogicAttemptHistory
};
