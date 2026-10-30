const db = require("../../../../config/db");

// =====================================================
// MENTOR REPLY TO DISCUSSION
// =====================================================

const replyToDiscussion = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);
        const discussionId = Number(req.params.discussionId);

        const { content } = req.body;

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
        // VALIDATE REPLY CONTENT
        // ---------------------------------------------

        if (
            typeof content !== "string" ||
            !content.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Reply content is required"
            });
        }

        if (content.trim().length > 5000) {
            return res.status(400).json({
                success: false,
                message: "Reply cannot exceed 5000 characters"
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
        // CHECK PARENT DISCUSSION
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
                message: "Discussion not found"
            });
        }

        // ---------------------------------------------
        // INSERT MENTOR REPLY
        // ---------------------------------------------

        const [result] = await db.query(
            `INSERT INTO logic_to_code_discussions
                (problem_id, user_id, parent_id, content)
             VALUES (?, ?, ?, ?)`,
            [
                problemId,
                mentorId,
                discussionId,
                content.trim()
            ]
        );

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(201).json({
            success: true,
            message: "Mentor reply added successfully",
            reply: {
                id: result.insertId,
                problem_id: problemId,
                user_id: mentorId,
                parent_id: discussionId,
                content: content.trim()
            }
        });

    } catch (error) {
        console.error("Mentor Discussion Reply Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add mentor reply"
        });
    }
};

module.exports = {
    replyToDiscussion
};