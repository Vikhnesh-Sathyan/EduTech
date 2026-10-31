
const db = require("../../../../config/db");

// =====================================================
// GET STUDENT LOGIC TO CODE DASHBOARD
// =====================================================

const getStudentDashboard = async (req, res) => {
    try {
        const studentId = req.user.id;

        // -------------------------------------------------
        // GET SUBMISSION STATISTICS
        // -------------------------------------------------

        const [stats] = await db.query(
            `SELECT
                COUNT(DISTINCT problem_id) AS attemptedProblems,

                COUNT(DISTINCT CASE
                    WHEN execution_status = 'accepted'
                    THEN problem_id
                END) AS completedProblems,

                COUNT(*) AS totalSubmissions,

                SUM(
                    CASE
                        WHEN execution_status = 'accepted'
                        THEN 1 ELSE 0
                    END
                ) AS acceptedSubmissions,

                SUM(
                    CASE
                        WHEN review_status = 'pending'
                        THEN 1 ELSE 0
                    END
                ) AS pendingFeedback

             FROM logic_to_code_submissions
             WHERE student_id = ?`,
            [studentId]
        );

        // -------------------------------------------------
        // GET BOOKMARK COUNT
        // -------------------------------------------------

        const [bookmarkResult] = await db.query(
            `SELECT COUNT(*) AS totalBookmarks
             FROM logic_to_code_bookmarks
             WHERE student_id = ?`,
            [studentId]
        );

        // -------------------------------------------------
        // GET DIFFICULTY-WISE PROGRESS
        // -------------------------------------------------

        const [difficultyProgress] = await db.query(
            `SELECT
                p.difficulty,

                COUNT(DISTINCT s.problem_id) AS attempted,

                COUNT(DISTINCT CASE
                    WHEN s.execution_status = 'accepted'
                    THEN s.problem_id
                END) AS completed

             FROM logic_to_code_problems p

             LEFT JOIN logic_to_code_submissions s
                ON p.id = s.problem_id
                AND s.student_id = ?

             WHERE p.status = 'published'

             GROUP BY p.difficulty

             ORDER BY FIELD(
                p.difficulty,
                'easy',
                'medium',
                'hard'
             )`,
            [studentId]
        );

        // -------------------------------------------------
        // GET RECENT SUBMISSIONS
        // -------------------------------------------------

        const [recentSubmissions] = await db.query(
            `SELECT
                s.id,
                s.problem_id,
                p.title AS problem_title,
                p.difficulty,
                s.language,
                s.execution_status,
                s.passed_test_cases,
                s.total_test_cases,
                s.submitted_at

             FROM logic_to_code_submissions s

             JOIN logic_to_code_problems p
                ON s.problem_id = p.id

             WHERE s.student_id = ?

             ORDER BY s.submitted_at DESC, s.id DESC

             LIMIT 5`,
            [studentId]
        );

        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Student dashboard fetched successfully",

            data: {
                statistics: {
                    ...stats[0],
                    totalBookmarks: bookmarkResult[0].totalBookmarks
                },

                difficultyProgress,

                recentSubmissions
            }
        });

    } catch (error) {
        console.error(
            "Get Student Dashboard Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch student dashboard"
        });
    }
};

module.exports = {
    getStudentDashboard
};
