
const db = require("../../../config/db");
const fs = require("fs");

// Delete an uploaded file when a submission fails validation or saving.
const removeUploadedFile = (file) => {
    if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }
};

// ==========================================
// GET APPROVED RESOURCES
// ==========================================
const getApprovedResources = async (req, res) => {
    try {
        const { subject_id, resource_type } = req.query;

        let sql = `
            SELECT
                r.id,
                r.student_id,
                r.subject_id,
                r.title,
                r.description,
                r.resource_type,
                r.resource_url,
                r.resource_content,
                r.status,
                r.created_at,
                u.name AS contributor_name,
                s.name AS subject_name
            FROM student_recommendation_resources r
            JOIN users u ON u.id = r.student_id
            JOIN subjects s ON s.id = r.subject_id
            WHERE r.status = 'approved'
        `;

        const params = [];

        if (subject_id) {
            sql += " AND r.subject_id = ?";
            params.push(subject_id);
        }

        if (resource_type) {
            const allowedTypes = [
                "notes", "pdf", "video", "image", "study_tips"
            ];

            if (!allowedTypes.includes(resource_type)) {
                return res.status(400).json({
                    message: "Invalid resource type"
                });
            }

            sql += " AND r.resource_type = ?";
            params.push(resource_type);
        }

        sql += " ORDER BY r.created_at DESC";

        const [resources] = await db.query(sql, params);

        return res.status(200).json({ resources });
    } catch (error) {
        console.error("Get approved resources error:", error);

        return res.status(500).json({
            message: "Failed to fetch approved resources"
        });
    }
};

// ==========================================
// SUBMIT A RESOURCE
// ==========================================
const submitResource = async (req, res) => {
    try {
        const {
            subject_id,
            title,
            description,
            resource_type,
            resource_url,
            resource_content
        } = req.body;

        if (req.user.role !== "student") {
            removeUploadedFile(req.file);

            return res.status(403).json({
                message: "Only students can submit learning resources"
            });
        }

        if (
            !subject_id ||
            !Number.isInteger(Number(subject_id)) ||
            Number(subject_id) <= 0 ||
            !title?.trim() ||
            !resource_type
        ) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                message: "A valid subject, title and resource type are required"
            });
        }

        if (title.trim().length > 200) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                message: "Title cannot exceed 200 characters"
            });
        }

        const allowedTypes = [
            "notes",
            "pdf",
            "video",
            "image",
            "study_tips"
        ];

        if (!allowedTypes.includes(resource_type)) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                message: "Invalid resource type"
            });
        }

        // Check that the selected subject exists.
        const [subjects] = await db.query(
            "SELECT id FROM subjects WHERE id = ?",
            [Number(subject_id)]
        );

        if (subjects.length === 0) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                message: "Selected subject does not exist"
            });
        }

        let savedResourceUrl = null;
        let savedResourceContent = null;

        // PDF and image submissions must include a matching file.
        if (resource_type === "pdf" || resource_type === "image") {
            if (!req.file) {
                return res.status(400).json({
                    message: "Please select a file to upload"
                });
            }

            const isPdf =
                resource_type === "pdf" &&
                req.file.mimetype === "application/pdf";

            const isImage =
                resource_type === "image" &&
                req.file.mimetype.startsWith("image/");

            if (!isPdf && !isImage) {
                removeUploadedFile(req.file);

                return res.status(400).json({
                    message: resource_type === "pdf"
                        ? "Please upload a PDF file"
                        : "Please upload an image file"
                });
            }

            // Public path served by the existing /uploads route.
            savedResourceUrl =
                `/uploads/recommendation/${req.file.filename}`;
        } else {
            // Other resource types must not upload a file.
            if (req.file) {
                removeUploadedFile(req.file);

                return res.status(400).json({
                    message: "Files are only allowed for PDF and image resources"
                });
            }

            if (resource_type === "video") {
                if (!resource_url?.trim()) {
                    return res.status(400).json({
                        message: "A video URL is required"
                    });
                }

                let parsedUrl;

                try {
                    parsedUrl = new URL(resource_url.trim());
                } catch {
                    return res.status(400).json({
                        message: "Please provide a valid video URL"
                    });
                }

                if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                    return res.status(400).json({
                        message: "Video URL must use HTTP or HTTPS"
                    });
                }

                savedResourceUrl = parsedUrl.href;
            } else {
                if (!resource_content?.trim()) {
                    return res.status(400).json({
                        message: "Resource content is required"
                    });
                }

                savedResourceContent = resource_content.trim();
            }
        }

        // Every new submission waits for admin approval.
        const [result] = await db.query(
            `INSERT INTO student_recommendation_resources
            (
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
                req.user.id,
                Number(subject_id),
                title.trim(),
                description?.trim() || null,
                resource_type,
                savedResourceUrl,
                savedResourceContent
            ]
        );

        return res.status(201).json({
            message: "Resource submitted successfully. Waiting for admin approval.",
            resourceId: result.insertId,
            status: "pending"
        });
    } catch (error) {
        removeUploadedFile(req.file);

        console.error("Submit resource error:", error);

        return res.status(500).json({
            message: "Failed to submit resource"
        });
    }
};

// ==========================================
// GET MY RESOURCE SUBMISSIONS
// ==========================================
const getMyResources = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can view their submissions"
            });
        }

        const [resources] = await db.query(
            `SELECT
                id,
                subject_id,
                title,
                description,
                resource_type,
                resource_url,
                resource_content,
                status,
                rejection_reason,
                created_at,
                updated_at,
                reviewed_at
             FROM student_recommendation_resources
             WHERE student_id = ?
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({ resources });
    } catch (error) {
        console.error("Get my resources error:", error);

        return res.status(500).json({
            message: "Failed to fetch your submissions"
        });
    }
};


/* ==========================================
   ADMIN: APPROVE A RESOURCE
========================================== */
const approveResource = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can approve resources"
            });
        }

        const resourceId = Number(req.params.id);

        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            return res.status(400).json({
                message: "Invalid resource ID"
            });
        }

        const [result] = await db.query(
            `UPDATE student_recommendation_resources
             SET status = 'approved',
                 rejection_reason = NULL,
                 reviewed_at = CURRENT_TIMESTAMP
             WHERE id = ?
               AND status = 'pending'`,
            [resourceId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Pending resource not found"
            });
        }

        return res.status(200).json({
            message: "Resource approved successfully",
            resourceId,
            status: "approved"
        });
    } catch (error) {
        console.error("Approve resource error:", error);

        return res.status(500).json({
            message: "Failed to approve resource"
        });
    }
};


/* ==========================================
   ADMIN: REJECT A RESOURCE
========================================== */
const rejectResource = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can reject resources"
            });
        }

        const resourceId = Number(req.params.id);
        const { rejection_reason } = req.body;

        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            return res.status(400).json({
                message: "Invalid resource ID"
            });
        }

        if (
            typeof rejection_reason !== "string" ||
            !rejection_reason.trim()
        ) {
            return res.status(400).json({
                message: "Please provide a reason for rejection"
            });
        }

        const [result] = await db.query(
            `UPDATE student_recommendation_resources
             SET status = 'rejected',
                 rejection_reason = ?,
                 reviewed_at = CURRENT_TIMESTAMP
             WHERE id = ?
               AND status = 'pending'`,
            [rejection_reason.trim(), resourceId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Pending resource not found"
            });
        }

        return res.status(200).json({
            message: "Resource rejected successfully",
            resourceId,
            status: "rejected",
            rejection_reason: rejection_reason.trim()
        });
    } catch (error) {
        console.error("Reject resource error:", error);

        return res.status(500).json({
            message: "Failed to reject resource"
        });
    }
};


/* ==========================================
   STUDENT: EDIT OWN RESOURCE
========================================== */

const updateResource = async (req, res) => {
    let databaseUpdated = false;

    try {
        if (req.user.role !== "student") {
            removeUploadedFile(req.file);

            return res.status(403).json({
                message: "Only students can edit their resources"
            });
        }

        const resourceId = Number(req.params.id);

        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                message: "Invalid resource ID"
            });
        }

        const {
            subject_id,
            title,
            description,
            resource_type,
            resource_url,
            resource_content
        } = req.body;

        if (
            !subject_id ||
            !Number.isInteger(Number(subject_id)) ||
            Number(subject_id) <= 0 ||
            typeof title !== "string" ||
            !title.trim() ||
            title.trim().length > 200 ||
            !resource_type
        ) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                message: "A valid subject, title and resource type are required"
            });
        }

        const allowedTypes = [
            "notes", "pdf", "video", "image", "study_tips"
        ];

        if (!allowedTypes.includes(resource_type)) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                message: "Invalid resource type"
            });
        }

        const [existingRows] = await db.query(
            `SELECT *
             FROM student_recommendation_resources
             WHERE id = ? AND student_id = ?`,
            [resourceId, req.user.id]
        );

        if (existingRows.length === 0) {
            removeUploadedFile(req.file);

            return res.status(404).json({
                message: "Resource not found or you do not own it"
            });
        }

        const existing = existingRows[0];

        const [subjects] = await db.query(
            "SELECT id FROM subjects WHERE id = ?",
            [Number(subject_id)]
        );

        if (subjects.length === 0) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                message: "Selected subject does not exist"
            });
        }

        let savedUrl = null;
        let savedContent = null;

        // PDF and image resources
        if (resource_type === "pdf" || resource_type === "image") {
            if (req.file) {
                const isPdf =
                    resource_type === "pdf" &&
                    req.file.mimetype === "application/pdf";

                const isImage =
                    resource_type === "image" &&
                    ["image/jpeg", "image/png", "image/webp", "image/gif"]
                        .includes(req.file.mimetype);

                if (!isPdf && !isImage) {
                    removeUploadedFile(req.file);

                    return res.status(400).json({
                        message: "Uploaded file does not match the resource type"
                    });
                }

                savedUrl = `/uploads/recommendation/${req.file.filename}`;
            } else {
                const oldFileMatchesType =
                    resource_type === "pdf"
                        ? existing.resource_type === "pdf"
                        : existing.resource_type === "image";

                if (
                    !oldFileMatchesType ||
                    !existing.resource_url?.startsWith(
                        "/uploads/recommendation/"
                    )
                ) {
                    return res.status(400).json({
                        message: "Please upload a file for this resource type"
                    });
                }

                savedUrl = existing.resource_url;
            }
        } else if (resource_type === "video") {
            if (req.file) {
                removeUploadedFile(req.file);

                return res.status(400).json({
                    message: "Video resources require a URL, not an uploaded file"
                });
            }

            if (
                typeof resource_url !== "string" ||
                !resource_url.trim()
            ) {
                return res.status(400).json({
                    message: "A video URL is required"
                });
            }

            try {
                const parsedUrl = new URL(resource_url.trim());

                if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                    throw new Error("Invalid protocol");
                }

                savedUrl = parsedUrl.href;
            } catch {
                return res.status(400).json({
                    message: "Please provide a valid HTTP or HTTPS video URL"
                });
            }
        } else {
            if (req.file) {
                removeUploadedFile(req.file);

                return res.status(400).json({
                    message: "This resource type does not accept uploaded files"
                });
            }

            if (
                typeof resource_content !== "string" ||
                !resource_content.trim()
            ) {
                return res.status(400).json({
                    message: "Resource content is required"
                });
            }

            savedContent = resource_content.trim();
        }

        // Update the database and require ownership to still match.
        const [updateResult] = await db.query(
            `UPDATE student_recommendation_resources
             SET subject_id = ?,
                 title = ?,
                 description = ?,
                 resource_type = ?,
                 resource_url = ?,
                 resource_content = ?,
                 status = 'pending',
                 rejection_reason = NULL,
                 reviewed_at = NULL
             WHERE id = ? AND student_id = ?`,
            [
                Number(subject_id),
                title.trim(),
                typeof description === "string" && description.trim()
                    ? description.trim()
                    : null,
                resource_type,
                savedUrl,
                savedContent,
                resourceId,
                req.user.id
            ]
        );

        if (updateResult.affectedRows === 0) {
            // The record may have disappeared before the update.
            removeUploadedFile(req.file);

            return res.status(404).json({
                message: "Resource was not found or could not be updated"
            });
        }

        // From here onward, never delete the new file in the catch block.
        databaseUpdated = true;

        // Clean up the previous uploaded file after the DB update.
        if (
            req.file &&
            existing.resource_url?.startsWith("/uploads/recommendation/")
        ) {
            const path = require("path");

            const oldFilePath = path.join(
                __dirname,
                "../../../uploads/recommendation",
                path.basename(existing.resource_url)
            );

            try {
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            } catch (fileError) {
                console.error(
                    "Resource updated, but old file cleanup failed:",
                    fileError
                );
            }
        }

        return res.status(200).json({
            message: "Resource updated successfully. It is pending admin approval again.",
            resourceId,
            status: "pending"
        });

    } catch (error) {
        // Only remove the newly uploaded file if the database
        // update did not succeed.
        if (!databaseUpdated) {
            removeUploadedFile(req.file);
        }

        console.error("Update resource error:", error);

        return res.status(500).json({
            message: databaseUpdated
                ? "Resource updated, but a follow-up operation failed"
                : "Failed to update resource"
        });
    }
};


/* ==========================================
   STUDENT: DELETE OWN RESOURCE
========================================== */

const deleteResource = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can delete their resources"
            });
        }

        const resourceId = Number(req.params.id);

        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            return res.status(400).json({
                message: "Invalid resource ID"
            });
        }

        // Find only a resource owned by this student
        const [rows] = await db.query(
            `SELECT resource_url
             FROM student_recommendation_resources
             WHERE id = ? AND student_id = ?`,
            [resourceId, req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Resource not found or you do not own it"
            });
        }

        const resourceUrl = rows[0].resource_url;

        // Delete the database record first
        const [result] = await db.query(
            `DELETE FROM student_recommendation_resources
             WHERE id = ? AND student_id = ?`,
            [resourceId, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Resource was not found"
            });
        }

        // Remove the uploaded file, if one exists
        if (resourceUrl?.startsWith("/uploads/recommendation/")) {
            const path = require("path");

            const filePath = path.join(
                __dirname,
                "../../../uploads/recommendation",
                path.basename(resourceUrl)
            );

            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (fileError) {
                // Keep the successful database deletion.
                // Log the leftover file so it can be cleaned up later.
                console.error(
                    "Resource deleted, but uploaded file cleanup failed:",
                    fileError
                );
            }
        }

        return res.status(200).json({
            message: "Resource deleted successfully",
            resourceId
        });

    } catch (error) {
        console.error("Delete resource error:", error);

        return res.status(500).json({
            message: "Failed to delete resource"
        });
    }
};


module.exports = {
    getApprovedResources,
    submitResource,
    getMyResources,
    approveResource,
    rejectResource,
    updateResource,
    deleteResource
};