
const db = require("../../../../config/db");

// =====================================================
// UPDATE OWN DISCUSSION
// =====================================================

const updateDiscussion = async (req, res) => {
    try {
        const studentId = req.user.id;
        const discussionId = req.params.discussionId;
        const { content } = req.body;

        if (!Number.isInteger(Number(discussionId)) || Number(discussionId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid discussion ID is required"
            });
        }

        if (!content || typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Discussion content is required"
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
                message: "Discussion not found or you cannot edit it"
            });
        }

        // Update discussion
        await db.query(
            `UPDATE logic_to_code_discussions
             SET content = ?,
                 is_edited = 1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?
             AND user_id = ?`,
            [content.trim(), discussionId, studentId]
        );

        return res.status(200).json({
            success: true,
            message: "Discussion updated successfully"
        });

    } catch (error) {
        console.error("Update Discussion Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { updateDiscussion };
