const db = require("../../../config/db");

// ==========================================
// BOOKMARK A CODING QUESTION
// ==========================================

const bookmarkCodePost = async (req, res) => {
    try {
        const postId = Number(req.params.postId);

if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({
        message: "Invalid coding question ID."
    });
}

        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can bookmark coding questions."
            });
        }

        const [posts] = await db.query(
            `SELECT scp.id
             FROM student_code_posts scp
             INNER JOIN subjects s
                ON s.id = scp.subject_id
             WHERE scp.id = ?
               AND scp.status = 'published'
               AND s.status = 'active'`,
            [postId]
        );

        if (posts.length === 0) {
            return res.status(404).json({
                message: "Coding question not found."
            });
        }

        const [existing] = await db.query(
            `SELECT id
             FROM student_code_bookmarks
             WHERE student_id = ? AND post_id = ?`,
            [req.user.id, postId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "You have already bookmarked this question."
            });
        }

        await db.query(
            `INSERT INTO student_code_bookmarks
                (student_id, post_id)
             VALUES (?, ?)`,
            [req.user.id, postId]
        );

        return res.status(201).json({
            message: "Coding question bookmarked successfully."
        });
    } catch (error) {
        console.error("Bookmark code post error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "You have already bookmarked this question."
            });
        }

        return res.status(500).json({
            message: "Failed to bookmark coding question."
        });
    }
};

// ==========================================
// REMOVE A BOOKMARK
// ==========================================

const removeCodeBookmark = async (req, res) => {
    try {
        const postId = Number(req.params.postId);

if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({
        message: "Invalid coding question ID."
    });
}

        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can remove bookmarks."
            });
        }

        const [result] = await db.query(
            `DELETE FROM student_code_bookmarks
             WHERE student_id = ? AND post_id = ?`,
            [req.user.id, postId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Bookmark not found."
            });
        }

        return res.status(200).json({
            message: "Bookmark removed successfully."
        });
    } catch (error) {
        console.error("Remove code bookmark error:", error);

        return res.status(500).json({
            message: "Failed to remove bookmark."
        });
    }
};

// ==========================================
// GET MY BOOKMARKED CODING QUESTIONS
// ==========================================

const getMyCodeBookmarks = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can view coding bookmarks."
            });
        }

        const [bookmarks] = await db.query(
            `SELECT
                b.id AS bookmark_id,
                b.created_at AS bookmarked_at,
                p.id AS post_id,
                p.title,
                p.problem_statement,
                p.description,
                p.difficulty,
                p.search_keywords,
                p.created_at,
                u.name AS student_name,
                s.id AS subject_id,
                s.name AS subject_name,
                (
                    SELECT COUNT(*)
                    FROM student_code_solutions cs
                    WHERE cs.post_id = p.id
                ) AS solution_count
             FROM student_code_bookmarks b
             INNER JOIN student_code_posts p
                ON p.id = b.post_id
             INNER JOIN subjects s
                ON s.id = p.subject_id
             INNER JOIN users u
                ON u.id = p.student_id
             WHERE b.student_id = ?
               AND p.status = 'published'
               AND s.status = 'active'
             ORDER BY b.created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            message: "Bookmarked coding questions retrieved successfully.",
            total_bookmarks: bookmarks.length,
            bookmarks
        });
    } catch (error) {
        console.error("Get code bookmarks error:", error);

        return res.status(500).json({
            message: "Failed to retrieve bookmarked coding questions."
        });
    }
};

module.exports = {
    bookmarkCodePost,
    removeCodeBookmark,
    getMyCodeBookmarks
};