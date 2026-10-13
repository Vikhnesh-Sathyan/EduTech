
const db = require("../../../config/db");

// ==========================================
// CREATE A DOUBT
// ==========================================
const createDoubt = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can ask doubts"
            });
        }

        const studentId = req.user.id;
        const { subject_id, title, question } = req.body;

        if (
            !subject_id ||
            !Number.isInteger(Number(subject_id)) ||
            Number(subject_id) <= 0 ||
            typeof title !== "string" ||
            !title.trim() ||
            title.trim().length > 200 ||
            typeof question !== "string" ||
            !question.trim()
        ) {
            return res.status(400).json({
                message: "Valid subject, title, and question are required"
            });
        }

        const [subjects] = await db.query(
            "SELECT id FROM subjects WHERE id = ?",
            [Number(subject_id)]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        const [result] = await db.query(
            `INSERT INTO student_community_doubts
                (student_id, subject_id, title, question)
             VALUES (?, ?, ?, ?)`,
            [
                studentId,
                Number(subject_id),
                title.trim(),
                question.trim()
            ]
        );

        return res.status(201).json({
            message: "Doubt posted successfully",
            doubtId: result.insertId
        });
    } catch (error) {
        console.error("Create doubt error:", error);

        return res.status(500).json({
            message: "Failed to create doubt"
        });
    }
};

// ==========================================
// GET ALL DOUBTS
// ==========================================
const getAllDoubts = async (req, res) => {
    try {
        const [doubts] = await db.query(
            `SELECT
                d.id,
                d.student_id,
                d.subject_id,
                d.title,
                d.question,
                d.created_at,
                d.updated_at,
                u.name AS student_name,
                s.name AS subject_name,
                COUNT(r.id) AS reply_count
             FROM student_community_doubts d
             JOIN users u ON u.id = d.student_id
             JOIN subjects s ON s.id = d.subject_id
             LEFT JOIN student_community_doubt_replies r
                ON r.doubt_id = d.id
             GROUP BY
                d.id,
                d.student_id,
                d.subject_id,
                d.title,
                d.question,
                d.created_at,
                d.updated_at,
                u.name,
                s.name
             ORDER BY d.created_at DESC`
        );

        return res.status(200).json({ doubts });
    } catch (error) {
        console.error("Get all doubts error:", error);

        return res.status(500).json({
            message: "Failed to fetch doubts"
        });
    }
};

// ==========================================
// GET A STUDENT'S DOUBTS
// ==========================================
const getMyDoubts = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can view their own doubts"
            });
        }

        const [doubts] = await db.query(
            `SELECT
                d.id,
                d.student_id,
                d.subject_id,
                d.title,
                d.question,
                d.created_at,
                d.updated_at,
                s.name AS subject_name,
                COUNT(r.id) AS reply_count
             FROM student_community_doubts d
             JOIN subjects s ON s.id = d.subject_id
             LEFT JOIN student_community_doubt_replies r
                ON r.doubt_id = d.id
             WHERE d.student_id = ?
             GROUP BY
                d.id,
                d.student_id,
                d.subject_id,
                d.title,
                d.question,
                d.created_at,
                d.updated_at,
                s.name
             ORDER BY d.created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({ doubts });
    } catch (error) {
        console.error("Get my doubts error:", error);

        return res.status(500).json({
            message: "Failed to fetch your doubts"
        });
    }
};

// ==========================================
// GET ONE DOUBT WITH REPLIES
// ==========================================
const getDoubtById = async (req, res) => {
    try {
        const doubtId = Number(req.params.id);

        if (!Number.isInteger(doubtId) || doubtId <= 0) {
            return res.status(400).json({
                message: "Invalid doubt ID"
            });
        }

        const [doubts] = await db.query(
            `SELECT
                d.id,
                d.student_id,
                d.subject_id,
                d.title,
                d.question,
                d.created_at,
                d.updated_at,
                u.name AS student_name,
                s.name AS subject_name
             FROM student_community_doubts d
             JOIN users u ON u.id = d.student_id
             JOIN subjects s ON s.id = d.subject_id
             WHERE d.id = ?`,
            [doubtId]
        );

        if (doubts.length === 0) {
            return res.status(404).json({
                message: "Doubt not found"
            });
        }

        const [replies] = await db.query(
            `SELECT
                r.id,
                r.doubt_id,
                r.student_id,
                r.reply,
                r.created_at,
                r.updated_at,
                u.name AS student_name
             FROM student_community_doubt_replies r
             JOIN users u ON u.id = r.student_id
             WHERE r.doubt_id = ?
             ORDER BY r.created_at ASC`,
            [doubtId]
        );

        return res.status(200).json({
            doubt: doubts[0],
            replies
        });
    } catch (error) {
        console.error("Get doubt details error:", error);

        return res.status(500).json({
            message: "Failed to fetch doubt details"
        });
    }
};

// ==========================================
// UPDATE OWN DOUBT
// ==========================================
const updateDoubt = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can edit their doubts"
            });
        }

        const doubtId = Number(req.params.id);
        const { subject_id, title, question } = req.body;

        if (!Number.isInteger(doubtId) || doubtId <= 0) {
            return res.status(400).json({
                message: "Invalid doubt ID"
            });
        }

        if (
            !subject_id ||
            !Number.isInteger(Number(subject_id)) ||
            Number(subject_id) <= 0 ||
            typeof title !== "string" ||
            !title.trim() ||
            title.trim().length > 200 ||
            typeof question !== "string" ||
            !question.trim()
        ) {
            return res.status(400).json({
                message: "Valid subject, title, and question are required"
            });
        }

        const [subjects] = await db.query(
            "SELECT id FROM subjects WHERE id = ?",
            [Number(subject_id)]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        const [result] = await db.query(
            `UPDATE student_community_doubts
             SET subject_id = ?, title = ?, question = ?
             WHERE id = ? AND student_id = ?`,
            [
                Number(subject_id),
                title.trim(),
                question.trim(),
                doubtId,
                req.user.id
            ]
        );

        if (result.affectedRows === 0) {
            const [existing] = await db.query(
                `SELECT id
                 FROM student_community_doubts
                 WHERE id = ?`,
                [doubtId]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    message: "Doubt not found"
                });
            }

            return res.status(403).json({
                message: "You can only edit your own doubts"
            });
        }

        return res.status(200).json({
            message: "Doubt updated successfully"
        });
    } catch (error) {
        console.error("Update doubt error:", error);

        return res.status(500).json({
            message: "Failed to update doubt"
        });
    }
};

// ==========================================
// DELETE OWN DOUBT
// ==========================================
const deleteDoubt = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can delete their doubts"
            });
        }

        const doubtId = Number(req.params.id);

        if (!Number.isInteger(doubtId) || doubtId <= 0) {
            return res.status(400).json({
                message: "Invalid doubt ID"
            });
        }

        const [result] = await db.query(
            `DELETE FROM student_community_doubts
             WHERE id = ? AND student_id = ?`,
            [doubtId, req.user.id]
        );

        if (result.affectedRows === 0) {
            const [existing] = await db.query(
                `SELECT id
                 FROM student_community_doubts
                 WHERE id = ?`,
                [doubtId]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    message: "Doubt not found"
                });
            }

            return res.status(403).json({
                message: "You can only delete your own doubts"
            });
        }

        return res.status(200).json({
            message: "Doubt deleted successfully"
        });
    } catch (error) {
        console.error("Delete doubt error:", error);

        return res.status(500).json({
            message: "Failed to delete doubt"
        });
    }
};

// ==========================================
// ADD A REPLY
// ==========================================
const createReply = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can reply to doubts"
            });
        }

        const doubtId = Number(req.params.id);
        const { reply } = req.body;

        if (!Number.isInteger(doubtId) || doubtId <= 0) {
            return res.status(400).json({
                message: "Invalid doubt ID"
            });
        }

        if (typeof reply !== "string" || !reply.trim()) {
            return res.status(400).json({
                message: "Reply is required"
            });
        }

        const [doubts] = await db.query(
            "SELECT id FROM student_community_doubts WHERE id = ?",
            [doubtId]
        );

        if (doubts.length === 0) {
            return res.status(404).json({
                message: "Doubt not found"
            });
        }

        const [result] = await db.query(
            `INSERT INTO student_community_doubt_replies
                (doubt_id, student_id, reply)
             VALUES (?, ?, ?)`,
            [doubtId, req.user.id, reply.trim()]
        );

        return res.status(201).json({
            message: "Reply posted successfully",
            replyId: result.insertId
        });
    } catch (error) {
        console.error("Create reply error:", error);

        return res.status(500).json({
            message: "Failed to post reply"
        });
    }
};

// ==========================================
// UPDATE OWN REPLY
// ==========================================
const updateReply = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can edit replies"
            });
        }

        const replyId = Number(req.params.replyId);
        const { reply } = req.body;

        if (!Number.isInteger(replyId) || replyId <= 0) {
            return res.status(400).json({
                message: "Invalid reply ID"
            });
        }

        if (typeof reply !== "string" || !reply.trim()) {
            return res.status(400).json({
                message: "Reply is required"
            });
        }

        const [result] = await db.query(
            `UPDATE student_community_doubt_replies
             SET reply = ?
             WHERE id = ? AND student_id = ?`,
            [reply.trim(), replyId, req.user.id]
        );

        if (result.affectedRows === 0) {
            const [existing] = await db.query(
                `SELECT id
                 FROM student_community_doubt_replies
                 WHERE id = ?`,
                [replyId]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    message: "Reply not found"
                });
            }

            return res.status(403).json({
                message: "You can only edit your own replies"
            });
        }

        return res.status(200).json({
            message: "Reply updated successfully"
        });
    } catch (error) {
        console.error("Update reply error:", error);

        return res.status(500).json({
            message: "Failed to update reply"
        });
    }
};

// ==========================================
// DELETE OWN REPLY
// ==========================================
const deleteReply = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can delete replies"
            });
        }

        const replyId = Number(req.params.replyId);

        if (!Number.isInteger(replyId) || replyId <= 0) {
            return res.status(400).json({
                message: "Invalid reply ID"
            });
        }

        const [result] = await db.query(
            `DELETE FROM student_community_doubt_replies
             WHERE id = ? AND student_id = ?`,
            [replyId, req.user.id]
        );

        if (result.affectedRows === 0) {
            const [existing] = await db.query(
                `SELECT id
                 FROM student_community_doubt_replies
                 WHERE id = ?`,
                [replyId]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    message: "Reply not found"
                });
            }

            return res.status(403).json({
                message: "You can only delete your own replies"
            });
        }

        return res.status(200).json({
            message: "Reply deleted successfully"
        });
    } catch (error) {
        console.error("Delete reply error:", error);

        return res.status(500).json({
            message: "Failed to delete reply"
        });
    }
};

module.exports = {
    createDoubt,
    getAllDoubts,
    getMyDoubts,
    getDoubtById,
    updateDoubt,
    deleteDoubt,
    createReply,
    updateReply,
    deleteReply
};
