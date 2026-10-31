
const db = require("../../../../config/db");

// =====================================================
// SOFT DELETE OWN DISCUSSION
// =====================================================

const deleteDiscussion = async (req, res) => {
    try {
        const studentId = req.user.id;
        const discussionId = req.params.discussionId;

        if (!Number.isInteger(Number(discussionId)) || Number(discussionId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid discussion ID is required"
            });
        }

        // Check ownership
        const [discussions] = await db.query(
            `SELECT id
             FROM logic_to_code_discussions
             WHERE id = ?
             AND user_id = ?
             AND is_deleted = 0`,
            [discussionId, studentId]
        );

        if (discussions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Discussion not found or you cannot delete it"
            });
        }

        // Soft-delete the discussion and all nested replies
        await db.query(
            `WITH RECURSIVE discussion_tree AS (
                SELECT id
                FROM logic_to_code_discussions
                WHERE id = ?

                UNION ALL

                SELECT child.id
                FROM logic_to_code_discussions child
                INNER JOIN discussion_tree parent
                    ON child.parent_id = parent.id
            )
            UPDATE logic_to_code_discussions
            SET is_deleted = 1
            WHERE id IN (
                SELECT id FROM discussion_tree
            )`,
            [discussionId]
        );

        return res.status(200).json({
            success: true,
            message: "Discussion and its replies deleted successfully"
        });

    } catch (error) {
        console.error("Delete Discussion Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { deleteDiscussion };
