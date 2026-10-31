
const db = require("../../../../config/db");

// =====================================================
// CREATE STUDENT DISCUSSION
// =====================================================

const createDiscussion = async (req, res) => {
    try {
        const studentId = req.user.id;
const problem_id = req.params.problemId;
const { content, parent_id } = req.body;
        // Validate problem ID
        if (!Number.isInteger(Number(problem_id)) || Number(problem_id) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid problem ID is required"
            });
        }

        // Validate discussion content
        if (!content || typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Discussion content is required"
            });
        }

        // Check whether problem is published
        const [problems] = await db.query(
            `SELECT id
             FROM logic_to_code_problems
             WHERE id = ? AND status = 'published'`,
            [problem_id]
        );

        if (problems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Published problem not found"
            });
        }

        // Validate parent discussion when replying
        if (parent_id !== undefined && parent_id !== null) {
            const [parents] = await db.query(
                `SELECT id
                 FROM logic_to_code_discussions
                 WHERE id = ?
                 AND problem_id = ?
                 AND is_deleted = 0`,
                [parent_id, problem_id]
            );

            if (parents.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Parent discussion not found"
                });
            }
        }

        // Insert discussion
        const [result] = await db.query(
            `INSERT INTO logic_to_code_discussions
             (problem_id, user_id, parent_id, content)
             VALUES (?, ?, ?, ?)`,
            [
                problem_id,
                studentId,
                parent_id || null,
                content.trim()
            ]
        );

        return res.status(201).json({
            success: true,
            message: parent_id
                ? "Reply added successfully"
                : "Discussion created successfully",
            discussionId: result.insertId
        });

    } catch (error) {
        console.error("Create Discussion Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { createDiscussion };
