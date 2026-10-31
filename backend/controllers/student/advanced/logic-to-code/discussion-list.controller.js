
const db = require("../../../../config/db");

// =====================================================
// GET DISCUSSIONS FOR A PROBLEM
// =====================================================

const getProblemDiscussions = async (req, res) => {
    try {
        const problemId = req.params.problemId;

        if (!Number.isInteger(Number(problemId)) || Number(problemId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid problem ID is required"
            });
        }

        // Check published problem
        const [problems] = await db.query(
            `SELECT id
             FROM logic_to_code_problems
             WHERE id = ? AND status = 'published'`,
            [problemId]
        );

        if (problems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Published problem not found"
            });
        }

        // Get discussions and replies
        const [discussions] = await db.query(
            `SELECT
                d.id,
                d.problem_id,
                d.user_id,
                d.parent_id,
                d.content,
                d.is_edited,
                d.created_at,
                d.updated_at,
                u.name AS user_name,
                u.role AS user_role
             FROM logic_to_code_discussions d
             JOIN users u ON d.user_id = u.id
             WHERE d.problem_id = ?
             AND d.is_deleted = 0
             ORDER BY d.created_at ASC`,
            [problemId]
        );

        return res.status(200).json({
            success: true,
            count: discussions.length,
            discussions
        });

    } catch (error) {
        console.error("Get Problem Discussions Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { getProblemDiscussions };
