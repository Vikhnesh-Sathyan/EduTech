const db = require("../../../../config/db");

// =====================================================
// GET PROBLEM DISCUSSIONS FOR MENTOR
// =====================================================

const getMentorProblemDiscussions = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        // ---------------------------------------------
        // VALIDATE PROBLEM ID
        // ---------------------------------------------

        if (
            !Number.isInteger(problemId) ||
            problemId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID"
            });
        }

        // ---------------------------------------------
        // CHECK PROBLEM OWNERSHIP
        // ---------------------------------------------

        const [problems] = await db.query(
            `SELECT id, title
             FROM logic_to_code_problems
             WHERE id = ?
               AND mentor_id = ?
             LIMIT 1`,
            [problemId, mentorId]
        );

        if (problems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        // ---------------------------------------------
        // GET DISCUSSIONS
        // ---------------------------------------------

        const [discussions] = await db.query(
            `SELECT
                d.id,
                d.problem_id,
                d.user_id,
                u.name AS user_name,
                u.role AS user_role,
                d.parent_id,
                d.content,
                d.is_edited,
                d.created_at,
                d.updated_at
             FROM logic_to_code_discussions d
             JOIN users u
                ON u.id = d.user_id
             WHERE d.problem_id = ?
               AND d.is_deleted = 0
             ORDER BY d.created_at ASC, d.id ASC`,
            [problemId]
        );

        // ---------------------------------------------
        // SEND RESPONSE
        // ---------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Problem discussions loaded successfully",
            problem: problems[0],
            totalDiscussions: discussions.length,
            discussions
        });

    } catch (error) {
        console.error("Mentor Discussion List Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load problem discussions"
        });
    }
};

module.exports = {
    getMentorProblemDiscussions
};