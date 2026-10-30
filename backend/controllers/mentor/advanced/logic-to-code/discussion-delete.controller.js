const db = require("../../../../config/db");

// =====================================================
// SOFT DELETE DISCUSSION MESSAGE
// =====================================================

const deleteDiscussion = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);
        const discussionId = Number(req.params.discussionId);

        // ---------------------------------------------
        // VALIDATE IDS
        // ---------------------------------------------

        if (
            !Number.isInteger(problemId) ||
            problemId <= 0 ||
            !Number.isInteger(discussionId) ||
            discussionId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem or discussion ID"
            });
        }

        // ---------------------------------------------
        // CHECK PROBLEM OWNERSHIP
        // ---------------------------------------------

        const [problems] = await db.query(
            `SELECT id
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
        // CHECK DISCUSSION
        // ---------------------------------------------

        const [discussions] = await db.query(
            `SELECT id
             FROM logic_to_code_discussions
             WHERE id = ?
               AND problem_id = ?
               AND is_deleted = 0
             LIMIT 1`,
            [discussionId, problemId]
        );

        if (discussions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Discussion message not found"
            });
        }

        // ---------------------------------------------
        // SOFT DELETE MESSAGE AND ITS REPLIES
        // ---------------------------------------------

        await db.query(
            `WITH RECURSIVE discussion_thread AS (
                SELECT id
                FROM logic_to_code_discussions
                WHERE id = ?
                  AND problem_id = ?

                UNION ALL

                SELECT child.id
                FROM logic_to_code_discussions child
                INNER JOIN discussion_thread parent
                    ON child.parent_id = parent.id
                WHERE child.problem_id = ?
             )
             UPDATE logic_to_code_discussions d
             INNER JOIN discussion_thread thread
                ON thread.id = d.id
             SET d.is_deleted = 1`,
            [discussionId, problemId, problemId]
        );

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Discussion message and its replies removed successfully"
        });

    } catch (error) {
        console.error("Discussion Delete Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove discussion message"
        });
    }
};

module.exports = {
    deleteDiscussion
};