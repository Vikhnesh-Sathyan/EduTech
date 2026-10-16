const db = require("../../../config/db");

// ==========================================
// ADD A COMMENT OR REPLY
// ==========================================

const createCodeComment = async (req, res) => {
    try {
        const postId = Number(req.params.postId);
const { comment, parent_comment_id } = req.body;

if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({
        message: "Invalid coding question ID."
    });
}

if (
    parent_comment_id != null &&
    (!Number.isInteger(Number(parent_comment_id)) ||
        Number(parent_comment_id) <= 0)
) {
    return res.status(400).json({
        message: "Invalid parent comment ID."
    });
}

        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can comment on coding questions."
            });
        }

        if (
            typeof comment !== "string" ||
            !comment.trim()
        ) {
            return res.status(400).json({
                message: "Comment cannot be empty."
            });
        }

        if (comment.trim().length > 10000) {
            return res.status(400).json({
                message: "Comment cannot exceed 10,000 characters."
            });
        }

        const [posts] = await db.query(
            `SELECT p.id
             FROM student_code_posts p
             INNER JOIN subjects s ON s.id = p.subject_id
             WHERE p.id = ?
               AND p.status = 'published'
               AND s.status = 'active'`,
            [postId]
        );

        if (posts.length === 0) {
            return res.status(404).json({
                message: "Coding question not found."
            });
        }

        if (parent_comment_id != null) {
            const [parents] = await db.query(
                `SELECT id
                 FROM student_code_comments
                 WHERE id = ? AND post_id = ?`,
                [parent_comment_id, postId]
            );

            if (parents.length === 0) {
                return res.status(404).json({
                    message: "Parent comment not found for this question."
                });
            }
        }

        const [result] = await db.query(
            `INSERT INTO student_code_comments
                (post_id, student_id, parent_comment_id, comment)
             VALUES (?, ?, ?, ?)`,
            [
                postId,
                req.user.id,
                parent_comment_id ?? null,
                comment.trim()
            ]
        );

        return res.status(201).json({
            message: parent_comment_id
                ? "Reply added successfully."
                : "Comment added successfully.",
            comment_id: result.insertId
        });
    } catch (error) {
        console.error("Create code comment error:", error);

        return res.status(500).json({
            message: "Failed to add comment."
        });
    }
};

// ==========================================
// GET COMMENTS AND REPLIES
// ==========================================

const getCodeComments = async (req, res) => {
    try {
        const postId = Number(req.params.postId);

if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({
        message: "Invalid coding question ID."
    });
}

        const [posts] = await db.query(
            `SELECT p.id
             FROM student_code_posts p
             INNER JOIN subjects s ON s.id = p.subject_id
             WHERE p.id = ?
               AND p.status = 'published'
               AND s.status = 'active'`,
            [postId]
        );

        if (posts.length === 0) {
            return res.status(404).json({
                message: "Coding question not found."
            });
        }

        const [comments] = await db.query(
            `SELECT
                c.id,
                c.post_id,
                c.student_id,
                u.name AS student_name,
                c.parent_comment_id,
                c.comment,
                c.created_at,
                c.updated_at
             FROM student_code_comments c
             INNER JOIN users u ON u.id = c.student_id
             WHERE c.post_id = ?
             ORDER BY c.created_at ASC, c.id ASC`,
            [postId]
        );

        return res.status(200).json({
            message: "Comments retrieved successfully.",
            post_id: Number(postId),
            total_comments: comments.length,
            comments
        });
    } catch (error) {
        console.error("Get code comments error:", error);

        return res.status(500).json({
            message: "Failed to retrieve comments."
        });
    }
};

// ==========================================
// UPDATE MY COMMENT OR REPLY
// ==========================================

const updateCodeComment = async (req, res) => {
    try {
        const postId = Number(req.params.postId);
const commentId = Number(req.params.commentId);
const { comment } = req.body;

if (
    !Number.isInteger(postId) ||
    postId <= 0 ||
    !Number.isInteger(commentId) ||
    commentId <= 0
) {
    return res.status(400).json({
        message: "Invalid coding question ID or comment ID."
    });
}

        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can edit comments."
            });
        }

        if (
            typeof comment !== "string" ||
            !comment.trim()
        ) {
            return res.status(400).json({
                message: "Comment cannot be empty."
            });
        }

        if (comment.trim().length > 10000) {
            return res.status(400).json({
                message: "Comment cannot exceed 10,000 characters."
            });
        }

        const [result] = await db.query(
            `UPDATE student_code_comments c
             INNER JOIN student_code_posts p
                ON p.id = c.post_id
             INNER JOIN subjects s
                ON s.id = p.subject_id
             SET c.comment = ?
             WHERE c.id = ?
               AND c.post_id = ?
               AND c.student_id = ?
               AND p.status = 'published'
               AND s.status = 'active'`,
            [
                comment.trim(),
                commentId,
                postId,
                req.user.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Your comment was not found or cannot be edited."
            });
        }

        return res.status(200).json({
            message: "Comment updated successfully."
        });
    } catch (error) {
        console.error("Update code comment error:", error);

        return res.status(500).json({
            message: "Failed to update comment."
        });
    }
};

// ==========================================
// DELETE MY COMMENT OR REPLY
// ==========================================

const deleteCodeComment = async (req, res) => {
    try {
        const postId = Number(req.params.postId);
const commentId = Number(req.params.commentId);

if (
    !Number.isInteger(postId) ||
    postId <= 0 ||
    !Number.isInteger(commentId) ||
    commentId <= 0
) {
    return res.status(400).json({
        message: "Invalid coding question ID or comment ID."
    });
}

        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can delete comments."
            });
        }

        const [result] = await db.query(
            `DELETE c
             FROM student_code_comments c
             INNER JOIN student_code_posts p
                ON p.id = c.post_id
             INNER JOIN subjects s
                ON s.id = p.subject_id
             WHERE c.id = ?
               AND c.post_id = ?
               AND c.student_id = ?
               AND p.status = 'published'
               AND s.status = 'active'`,
            [commentId, postId, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Your comment was not found or cannot be deleted."
            });
        }

        return res.status(200).json({
            message: "Comment deleted successfully."
        });
    } catch (error) {
        console.error("Delete code comment error:", error);

        return res.status(500).json({
            message: "Failed to delete comment."
        });
    }
};

module.exports = {
    createCodeComment,
    getCodeComments,
    updateCodeComment,
    deleteCodeComment
};
