const db = require("../../../config/db");

// =====================================================
// HELPER: VALIDATE A POSITIVE INTEGER ID
// =====================================================

const isValidId = (value) => {
    return (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== "" &&
        /^\d+$/.test(String(value)) &&
        Number.isSafeInteger(Number(value)) &&
        Number(value) > 0
    );
};


// =====================================================
// GET APPROVED COMMUNITY DOUBTS FOR A SUBJECT
// GET /api/student/recommendations/doubts?subjectId=1
// =====================================================

const getApprovedDoubts = async (req, res) => {
    try {
        const { subjectId } = req.query;

        if (!isValidId(subjectId)) {
            return res.status(400).json({
                message: "A valid subject ID is required"
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
                u.name AS student_name,
                COUNT(reply_users.id) AS reply_count
             FROM student_community_doubts d
             INNER JOIN users u
                ON u.id = d.student_id
             INNER JOIN subjects s
                ON s.id = d.subject_id
             LEFT JOIN student_community_doubt_replies r
                ON r.doubt_id = d.id
             LEFT JOIN users reply_users
                ON reply_users.id = r.student_id
                AND reply_users.status = 'active'
             WHERE d.subject_id = ?
               AND d.status = 'approved'
               AND s.status = 'active'
               AND u.status = 'active'
             GROUP BY
                d.id,
                d.student_id,
                d.subject_id,
                d.title,
                d.question,
                d.created_at,
                u.name
             ORDER BY d.created_at DESC`,
            [Number(subjectId)]
        );

        return res.status(200).json({
            message: "Community doubts fetched successfully",
            doubts
        });

    } catch (error) {
        console.error("Get approved doubts error:", error);

        return res.status(500).json({
            message: "Failed to fetch community doubts"
        });
    }
};


// =====================================================
// CREATE A COMMUNITY DOUBT
// POST /api/student/recommendations/doubts
// New doubts require admin approval.
// =====================================================

const createDoubt = async (req, res) => {
    try {
        const studentId = req.user.id;

        const {
            subject_id,
            title,
            question
        } = req.body;

        // Validate subject ID
        if (!isValidId(subject_id)) {
            return res.status(400).json({
                message: "A valid subject is required"
            });
        }

        // Validate title
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Doubt title is required"
            });
        }

        const cleanTitle = title.trim();

        if (cleanTitle.length > 200) {
            return res.status(400).json({
                message: "Title cannot exceed 200 characters"
            });
        }

        // Validate question
        if (typeof question !== "string" || !question.trim()) {
            return res.status(400).json({
                message: "Question details are required"
            });
        }

        const cleanQuestion = question.trim();

        // Confirm the subject exists and is active
        const [subjects] = await db.query(
            `SELECT id
             FROM subjects
             WHERE id = ?
               AND status = 'active'
             LIMIT 1`,
            [Number(subject_id)]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                message: "Active subject not found"
            });
        }

        // Save the doubt as pending for admin review
        const [result] = await db.query(
            `INSERT INTO student_community_doubts (
                student_id,
                subject_id,
                title,
                question,
                status
            )
            VALUES (?, ?, ?, ?, 'pending')`,
            [
                studentId,
                Number(subject_id),
                cleanTitle,
                cleanQuestion
            ]
        );

        return res.status(201).json({
            message: "Doubt submitted successfully. It is awaiting admin review.",
            doubtId: result.insertId,
            status: "pending"
        });

    } catch (error) {
        console.error("Create community doubt error:", error);

        return res.status(500).json({
            message: "Failed to submit doubt"
        });
    }
};


// =====================================================
// GET THE LOGGED-IN STUDENT'S DOUBT SUBMISSIONS
// GET /api/student/recommendations/doubts/my
// Includes pending, approved and rejected doubts.
// =====================================================

const getMyDoubts = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [doubts] = await db.query(
            `SELECT
                d.id,
                d.subject_id,
                s.name AS subject_name,
                d.title,
                d.question,
                d.status,
                d.rejection_reason,
                d.created_at,
                d.updated_at,
                d.reviewed_at
             FROM student_community_doubts d
             INNER JOIN subjects s
                ON s.id = d.subject_id
             WHERE d.student_id = ?
             ORDER BY d.created_at DESC`,
            [studentId]
        );

        return res.status(200).json({
            message: "Your doubt submissions fetched successfully",
            doubts
        });

    } catch (error) {
        console.error("Get my doubts error:", error);

        return res.status(500).json({
            message: "Failed to fetch your doubt submissions"
        });
    }
};


// =====================================================
// GET REPLIES FOR AN APPROVED DOUBT
// GET /api/student/recommendations/doubts/:doubtId/replies
// =====================================================

const getDoubtReplies = async (req, res) => {
    try {
        const { doubtId } = req.params;

        if (!isValidId(doubtId)) {
            return res.status(400).json({
                message: "A valid doubt ID is required"
            });
        }

        // Only approved doubts belonging to active subjects
        // can have their replies viewed.
        const [doubts] = await db.query(
            `SELECT d.id
             FROM student_community_doubts d
             INNER JOIN subjects s
                ON s.id = d.subject_id
             WHERE d.id = ?
               AND d.status = 'approved'
               AND s.status = 'active'
             LIMIT 1`,
            [Number(doubtId)]
        );

        if (doubts.length === 0) {
            return res.status(404).json({
                message: "Approved doubt not found"
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
             INNER JOIN users u
                ON u.id = r.student_id
             WHERE r.doubt_id = ?
               AND u.status = 'active'
             ORDER BY r.created_at ASC`,
            [Number(doubtId)]
        );

        return res.status(200).json({
            message: "Doubt replies fetched successfully",
            replies
        });

    } catch (error) {
        console.error("Get doubt replies error:", error);

        return res.status(500).json({
            message: "Failed to fetch doubt replies"
        });
    }
};


// =====================================================
// REPLY TO AN APPROVED DOUBT
// POST /api/student/recommendations/doubts/:doubtId/replies
// Replies are published immediately without admin approval.
// =====================================================

const createReply = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { doubtId } = req.params;
        const { reply } = req.body;

        if (!isValidId(doubtId)) {
            return res.status(400).json({
                message: "A valid doubt ID is required"
            });
        }

        if (typeof reply !== "string" || !reply.trim()) {
            return res.status(400).json({
                message: "Reply cannot be empty"
            });
        }

        const cleanReply = reply.trim();

        // Verify that the doubt is approved
        // and its subject is active.
        const [doubts] = await db.query(
            `SELECT d.id
             FROM student_community_doubts d
             INNER JOIN subjects s
                ON s.id = d.subject_id
             WHERE d.id = ?
               AND d.status = 'approved'
               AND s.status = 'active'
             LIMIT 1`,
            [Number(doubtId)]
        );

        if (doubts.length === 0) {
            return res.status(404).json({
                message: "Approved doubt not found"
            });
        }

        // Replies do not require admin approval.
        const [result] = await db.query(
            `INSERT INTO student_community_doubt_replies (
                doubt_id,
                student_id,
                reply
            )
            VALUES (?, ?, ?)`,
            [
                Number(doubtId),
                studentId,
                cleanReply
            ]
        );

        return res.status(201).json({
            message: "Reply posted successfully",
            replyId: result.insertId
        });

    } catch (error) {
        console.error("Create doubt reply error:", error);

        return res.status(500).json({
            message: "Failed to post reply"
        });
    }
};


// =====================================================
// EXPORT CONTROLLER FUNCTIONS
// =====================================================

module.exports = {
    getApprovedDoubts,
    createDoubt,
    getMyDoubts,
    getDoubtReplies,
    createReply
};