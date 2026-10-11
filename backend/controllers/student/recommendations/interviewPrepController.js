const db = require("../../../config/db");

// =====================================================
// ALLOWED INTERVIEW PREPARATION TYPES
// =====================================================

const allowedPrepTypes = [
    "technical_question",
    "coding_challenge",
    "hr_question",
    "interview_experience",
    "preparation_tip"
];

const allowedDifficulties = [
    "beginner",
    "intermediate",
    "advanced"
];


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
// GET APPROVED INTERVIEW PREPARATION CONTENT
// GET /api/student/recommendations/interview-prep
//
// Optional query parameters:
// subjectId=1
// prepType=technical_question
// difficulty=beginner
// =====================================================

const getApprovedInterviewPrep = async (req, res) => {
    try {
        const { subjectId, prepType, difficulty } = req.query;

        // Validate optional subject ID
        if (
            subjectId !== undefined &&
            !isValidId(subjectId)
        ) {
            return res.status(400).json({
                message: "A valid subject ID is required"
            });
        }

        // Validate optional preparation type
        if (
            prepType !== undefined &&
            !allowedPrepTypes.includes(prepType)
        ) {
            return res.status(400).json({
                message: "Invalid interview preparation type"
            });
        }

        // Validate optional difficulty
        if (
            difficulty !== undefined &&
            !allowedDifficulties.includes(difficulty)
        ) {
            return res.status(400).json({
                message: "Invalid difficulty level"
            });
        }

        let sql = `
            SELECT
                p.id,
                p.student_id,
                p.subject_id,
                s.name AS subject_name,
                p.title,
                p.description,
                p.prep_type,
                p.content,
                p.difficulty,
                p.created_at,
                u.name AS student_name
            FROM student_interview_prep p
            INNER JOIN users u
                ON u.id = p.student_id
            LEFT JOIN subjects s
                ON s.id = p.subject_id
            WHERE p.status = 'approved'
              AND u.status = 'active'
              AND (
                  p.subject_id IS NULL
                  OR s.status = 'active'
              )
        `;

        const params = [];

        if (subjectId !== undefined) {
            sql += " AND p.subject_id = ?";
            params.push(Number(subjectId));
        }

        if (prepType !== undefined) {
            sql += " AND p.prep_type = ?";
            params.push(prepType);
        }

        if (difficulty !== undefined) {
            sql += " AND p.difficulty = ?";
            params.push(difficulty);
        }

        sql += " ORDER BY p.created_at DESC";

        const [items] = await db.query(sql, params);

        return res.status(200).json({
            message: "Interview preparation content fetched successfully",
            items
        });

    } catch (error) {
        console.error("Get interview prep error:", error);

        return res.status(500).json({
            message: "Failed to fetch interview preparation content"
        });
    }
};


// =====================================================
// SUBMIT INTERVIEW PREPARATION CONTENT
// POST /api/student/recommendations/interview-prep
//
// All new submissions require admin approval.
// =====================================================

const createInterviewPrep = async (req, res) => {
    try {
        const studentId = req.user.id;

        const {
            subject_id,
            title,
            description,
            prep_type,
            content,
            difficulty
        } = req.body;

        // Validate optional subject ID
        if (
            subject_id !== undefined &&
            subject_id !== null &&
            subject_id !== "" &&
            !isValidId(subject_id)
        ) {
            return res.status(400).json({
                message: "A valid subject ID is required"
            });
        }

        // Validate title
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        const cleanTitle = title.trim();

        if (cleanTitle.length > 200) {
            return res.status(400).json({
                message: "Title cannot exceed 200 characters"
            });
        }

        // Validate preparation type
        if (!allowedPrepTypes.includes(prep_type)) {
            return res.status(400).json({
                message: "A valid interview preparation type is required"
            });
        }

        // Validate content
        if (typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                message: "Interview preparation content is required"
            });
        }

        // Validate optional difficulty
        if (
            difficulty !== undefined &&
            difficulty !== null &&
            difficulty !== "" &&
            !allowedDifficulties.includes(difficulty)
        ) {
            return res.status(400).json({
                message: "Invalid difficulty level"
            });
        }

        const cleanDescription =
            typeof description === "string"
                ? description.trim()
                : null;

        const cleanContent = content.trim();

        // Verify the subject when one is provided
        let subjectId = null;

        if (
            subject_id !== undefined &&
            subject_id !== null &&
            subject_id !== ""
        ) {
            subjectId = Number(subject_id);

            const [subjects] = await db.query(
                `SELECT id
                 FROM subjects
                 WHERE id = ?
                   AND status = 'active'
                 LIMIT 1`,
                [subjectId]
            );

            if (subjects.length === 0) {
                return res.status(404).json({
                    message: "Active subject not found"
                });
            }
        }

        // Save the submission as pending for admin review
        const [result] = await db.query(
            `INSERT INTO student_interview_prep (
                student_id,
                subject_id,
                title,
                description,
                prep_type,
                content,
                difficulty,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                studentId,
                subjectId,
                cleanTitle,
                cleanDescription || null,
                prep_type,
                cleanContent,
                difficulty || null
            ]
        );

        return res.status(201).json({
            message: "Interview preparation content submitted successfully. It is awaiting admin review.",
            itemId: result.insertId,
            status: "pending"
        });

    } catch (error) {
        console.error("Create interview prep error:", error);

        return res.status(500).json({
            message: "Failed to submit interview preparation content"
        });
    }
};


// =====================================================
// GET THE LOGGED-IN STUDENT'S INTERVIEW PREP SUBMISSIONS
// GET /api/student/recommendations/interview-prep/my
// Includes pending, approved and rejected submissions.
// =====================================================

const getMyInterviewPrep = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [items] = await db.query(
            `SELECT
                p.id,
                p.subject_id,
                s.name AS subject_name,
                p.title,
                p.description,
                p.prep_type,
                p.content,
                p.difficulty,
                p.status,
                p.rejection_reason,
                p.created_at,
                p.updated_at,
                p.reviewed_at
             FROM student_interview_prep p
             LEFT JOIN subjects s
                ON s.id = p.subject_id
             WHERE p.student_id = ?
             ORDER BY p.created_at DESC`,
            [studentId]
        );

        return res.status(200).json({
            message: "Your interview preparation submissions fetched successfully",
            items
        });

    } catch (error) {
        console.error("Get my interview prep error:", error);

        return res.status(500).json({
            message: "Failed to fetch your interview preparation submissions"
        });
    }
};


// =====================================================
// EXPORT CONTROLLER FUNCTIONS
// =====================================================

module.exports = {
    getApprovedInterviewPrep,
    createInterviewPrep,
    getMyInterviewPrep
};