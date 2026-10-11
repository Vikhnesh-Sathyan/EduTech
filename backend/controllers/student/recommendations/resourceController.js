const db = require("../../../config/db");

// =====================================================
// GET APPROVED RESOURCES FOR A SUBJECT
// GET /api/student/recommendations/resources?subjectId=1
// =====================================================

const getApprovedResources = async (req, res) => {
    try {
        const { subjectId } = req.query;

        if (
            !subjectId ||
            !Number.isInteger(Number(subjectId)) ||
            Number(subjectId) <= 0
        ) {
            return res.status(400).json({
                message: "A valid subject ID is required"
            });
        }

        const [resources] = await db.query(
            `SELECT
                r.id,
                r.subject_id,
                r.title,
                r.description,
                r.resource_type,
                r.resource_url,
                r.resource_content,
                r.created_at,
                u.name AS student_name
             FROM student_recommendation_resources r
             INNER JOIN users u
                ON u.id = r.student_id
             INNER JOIN subjects s
                ON s.id = r.subject_id
             WHERE r.subject_id = ?
               AND r.status = 'approved'
               AND s.status = 'active'
               AND u.status = 'active'
             ORDER BY r.created_at DESC`,
            [Number(subjectId)]
        );

        return res.status(200).json({
            message: "Resources fetched successfully",
            resources
        });

    } catch (error) {
        console.error("Get approved resources error:", error);

        return res.status(500).json({
            message: "Failed to fetch resources"
        });
    }
};


// =====================================================
// CREATE RESOURCE SUBMISSION
// POST /api/student/recommendations/resources
// New submissions require admin approval.
// =====================================================

const createResource = async (req, res) => {
    try {
        const studentId = req.user.id;

        const {
            subject_id,
            title,
            description,
            resource_type,
            resource_url,
            resource_content
        } = req.body;

        const allowedTypes = [
            "notes",
            "pdf",
            "explanation",
            "code",
            "video",
            "exam_tips",
            "study_tricks",
            "image",
            "other"
        ];

        // Validate subject ID
        if (
            !subject_id ||
            !Number.isInteger(Number(subject_id)) ||
            Number(subject_id) <= 0
        ) {
            return res.status(400).json({
                message: "A valid subject is required"
            });
        }

        // Validate title
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Resource title is required"
            });
        }

        if (title.trim().length > 200) {
            return res.status(400).json({
                message: "Title cannot exceed 200 characters"
            });
        }

        // Validate resource type
        if (!allowedTypes.includes(resource_type)) {
            return res.status(400).json({
                message: "A valid resource type is required"
            });
        }

        const cleanDescription =
            typeof description === "string"
                ? description.trim()
                : null;

        const cleanUrl =
            typeof resource_url === "string"
                ? resource_url.trim()
                : null;

        const cleanContent =
            typeof resource_content === "string"
                ? resource_content.trim()
                : null;

        // Require a URL or actual resource content
        if (!cleanUrl && !cleanContent) {
            return res.status(400).json({
                message: "Provide a resource URL or resource content"
            });
        }

        if (cleanUrl && cleanUrl.length > 500) {
            return res.status(400).json({
                message: "Resource URL cannot exceed 500 characters"
            });
        }

        // Confirm that the subject exists and is active
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

        // Save the resource as pending for admin review
        const [result] = await db.query(
            `INSERT INTO student_recommendation_resources (
                student_id,
                subject_id,
                title,
                description,
                resource_type,
                resource_url,
                resource_content,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                studentId,
                Number(subject_id),
                title.trim(),
                cleanDescription || null,
                resource_type,
                cleanUrl || null,
                cleanContent || null
            ]
        );

        return res.status(201).json({
            message: "Resource submitted successfully. It is awaiting admin review.",
            resourceId: result.insertId,
            status: "pending"
        });

    } catch (error) {
        console.error("Create resource error:", error);

        return res.status(500).json({
            message: "Failed to submit resource"
        });
    }
};


// =====================================================
// GET THE LOGGED-IN STUDENT'S RESOURCE SUBMISSIONS
// GET /api/student/recommendations/resources/my
// Includes pending, approved and rejected submissions.
// =====================================================

const getMyResources = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [resources] = await db.query(
            `SELECT
                r.id,
                r.subject_id,
                s.name AS subject_name,
                r.title,
                r.description,
                r.resource_type,
                r.resource_url,
                r.resource_content,
                r.status,
                r.rejection_reason,
                r.created_at,
                r.updated_at,
                r.reviewed_at
             FROM student_recommendation_resources r
             INNER JOIN subjects s
                ON s.id = r.subject_id
             WHERE r.student_id = ?
             ORDER BY r.created_at DESC`,
            [studentId]
        );

        return res.status(200).json({
            message: "Your resource submissions fetched successfully",
            resources
        });

    } catch (error) {
        console.error("Get my resources error:", error);

        return res.status(500).json({
            message: "Failed to fetch your resource submissions"
        });
    }
};


// =====================================================
// EXPORT CONTROLLER FUNCTIONS
// =====================================================

module.exports = {
    getApprovedResources,
    createResource,
    getMyResources
};