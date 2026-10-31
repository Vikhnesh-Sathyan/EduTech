
const db = require("../../../../config/db");

// ==========================================
// GET STUDENT REFERENCE SOLUTIONS
// ==========================================

const getStudentReferenceSolutions = async (req, res) => {
    try {
        const studentId = req.user.id;
        const problemId = Number(req.params.problemId);

        if (
            !Number.isSafeInteger(problemId) ||
            problemId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
            });
        }

        // Fetch published problem and unlock rule
        const [problems] = await db.query(
            `SELECT id, solution_unlock
             FROM logic_to_code_problems
             WHERE id = ?
             AND status = 'published'`,
            [problemId]
        );

        if (problems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Published problem not found."
            });
        }

        const unlockRule = problems[0].solution_unlock;

        // Mentor-only solutions cannot be viewed by students
        if (unlockRule === "mentor_only") {
            return res.status(403).json({
                success: false,
                message: "Reference solutions are available only to mentors."
            });
        }

        // Check student's submission history
        const [submissions] = await db.query(
            `SELECT
                COUNT(*) AS totalAttempts,
                SUM(
                    CASE
                        WHEN execution_status = 'accepted'
                        AND total_test_cases > 0
                        AND passed_test_cases = total_test_cases
                        THEN 1
                        ELSE 0
                    END
                ) AS completedAttempts
             FROM logic_to_code_submissions
             WHERE problem_id = ?
             AND student_id = ?`,
            [problemId, studentId]
        );

        const totalAttempts = Number(
            submissions[0].totalAttempts
        );

        const completedAttempts = Number(
            submissions[0].completedAttempts || 0
        );

        // Apply unlock conditions
        if (
            unlockRule === "after_attempt" &&
            totalAttempts === 0
        ) {
            return res.status(403).json({
                success: false,
                message: "Submit at least one attempt to unlock the reference solution."
            });
        }

        if (
            unlockRule === "after_completion" &&
            completedAttempts === 0
        ) {
            return res.status(403).json({
                success: false,
                message: "Complete the problem successfully to unlock the reference solution."
            });
        }

        // Fetch reference solutions after access validation
        const [solutions] = await db.query(
            `SELECT
                id,
                language,
                solution_code,
                solution_explanation,
                created_at,
                updated_at
             FROM logic_to_code_solutions
             WHERE problem_id = ?
             ORDER BY language ASC`,
            [problemId]
        );

        return res.status(200).json({
            success: true,
            message: "Reference solutions fetched successfully.",
            totalSolutions: solutions.length,
            solutions
        });

    } catch (error) {
        console.error(
            "Get Student Reference Solutions Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch reference solutions."
        });
    }
};

module.exports = {
    getStudentReferenceSolutions
};
