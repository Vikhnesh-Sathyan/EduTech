const db = require("../../../../config/db");

// =====================================================
// GET MENTOR LOGIC TO CODE DASHBOARD
// =====================================================

const getMentorProblemDashboard = async (req, res) => {
    try {
        const mentorId = req.user.id;

        // ---------------------------------------------
        // 1. PROBLEM STATISTICS
        // ---------------------------------------------

        const [problemStats] = await db.query(
            `SELECT
                COUNT(*) AS totalProblems,
                COALESCE(SUM(status = 'published'), 0) AS publishedProblems,
                COALESCE(SUM(status = 'draft'), 0) AS draftProblems,
                COALESCE(SUM(status = 'archived'), 0) AS archivedProblems
             FROM logic_to_code_problems
             WHERE mentor_id = ?`,
            [mentorId]
        );

        // ---------------------------------------------
        // 2. SUBMISSION STATISTICS
        // ---------------------------------------------

        const [submissionStats] = await db.query(
            `SELECT
                COUNT(s.id) AS totalAttempts,
                COUNT(DISTINCT
                    CASE
                        WHEN s.execution_status = 'accepted'
                        THEN CONCAT(s.problem_id, '-', s.student_id)
                    END
                ) AS completedProblems
             FROM logic_to_code_submissions s
             JOIN logic_to_code_problems p
                ON p.id = s.problem_id
             WHERE p.mentor_id = ?`,
            [mentorId]
        );

        // ---------------------------------------------
        // 3. PENDING STUDENT DOUBTS
        // ---------------------------------------------

        const [doubtStats] = await db.query(
            `SELECT COUNT(*) AS pendingDoubts
             FROM logic_to_code_discussions d
             JOIN logic_to_code_problems p
                ON p.id = d.problem_id
             JOIN users u
                ON u.id = d.user_id
             WHERE p.mentor_id = ?
               AND d.parent_id IS NULL
               AND d.is_deleted = 0
               AND u.role = 'student'
               AND NOT EXISTS (
                    SELECT 1
                    FROM logic_to_code_discussions r
                    JOIN users mentor
                        ON mentor.id = r.user_id
                    WHERE r.parent_id = d.id
                      AND r.is_deleted = 0
                      AND mentor.role = 'mentor'
               )`,
            [mentorId]
        );

        // ---------------------------------------------
        // 4. RECENT STUDENT SUBMISSIONS
        // ---------------------------------------------

        const [recentSubmissions] = await db.query(
            `SELECT
                s.id,
                s.problem_id,
                p.title AS problem_title,
                u.name AS student_name,
                s.language,
                s.execution_status,
                s.passed_test_cases,
                s.total_test_cases,
                s.submitted_at
             FROM logic_to_code_submissions s
             JOIN logic_to_code_problems p
                ON p.id = s.problem_id
             JOIN users u
                ON u.id = s.student_id
             WHERE p.mentor_id = ?
             ORDER BY s.submitted_at DESC
             LIMIT 5`,
            [mentorId]
        );

        // ---------------------------------------------
        // 5. SEND DASHBOARD RESPONSE
        // ---------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Mentor dashboard loaded successfully",

            statistics: {
                ...problemStats[0],
                ...submissionStats[0],
                ...doubtStats[0]
            },

            recentSubmissions
        });

    } catch (error) {
        console.error("Mentor Logic To Code Dashboard Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load mentor dashboard"
        });
    }
};

module.exports = {
    getMentorProblemDashboard
};