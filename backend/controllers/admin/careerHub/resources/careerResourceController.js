const db = require("../../../../config/db");

const fs = require("fs/promises");
const path = require("path");

// ==========================================
// GET ALL CAREER RESOURCES
// ==========================================

const getCareerResources = async (req, res) => {

    try {

        const [resources] = await db.execute(
            `SELECT
                cr.id,
                cr.resource_type,
                cr.title,
                cr.country_id,
                cc.country_name,
                cr.experience_level,
                cr.description,
                cr.created_by,
                u.name AS contributor_name,
                cr.status,
                cr.publication_confirmed_at,
                cr.created_at,
                cr.updated_at,

                (
                    SELECT COUNT(*)
                    FROM career_resource_files crf
                    WHERE crf.resource_id = cr.id
                ) AS file_count,

                (
                    SELECT crf.file_name
                    FROM career_resource_files crf
                    WHERE crf.resource_id = cr.id
                    AND crf.file_type = 'public_copy'
                    LIMIT 1
                ) AS public_copy_name,

                (
                    SELECT crf.file_size
                    FROM career_resource_files crf
                    WHERE crf.resource_id = cr.id
                    AND crf.file_type = 'public_copy'
                    LIMIT 1
                ) AS public_copy_size

            FROM career_resources cr

            LEFT JOIN career_countries cc
                ON cc.id = cr.country_id

            LEFT JOIN users u
                ON u.id = cr.created_by

            ORDER BY cr.created_at DESC`
        );

        return res.status(200).json({
            message: "Career resources fetched successfully",
            resources
        });

    } catch (error) {

        console.error("Get career resources error:", error);

        return res.status(500).json({
            message: "Unable to fetch career resources"
        });
    }
};



const previewCareerResource = async (req, res) => {

    try {

        const resourceId = Number(req.params.resourceId);

        // ==========================================
        // VALIDATE RESOURCE ID
        // ==========================================

        if (!Number.isInteger(resourceId) || resourceId <= 0) {

            return res.status(400).json({
                message: "Invalid resource ID"
            });
        }

        // ==========================================
        // GET PUBLISHED PUBLIC COPY
        // ==========================================

        const [files] = await db.execute(
            `SELECT
                cr.id,
                cr.title,
                crf.file_path,
                crf.file_name

             FROM career_resources cr

             INNER JOIN career_resource_files crf
                ON crf.resource_id = cr.id

             WHERE cr.id = ?
             AND cr.status = 'published'
             AND crf.file_type = 'public_copy'

             LIMIT 1`,
            [resourceId]
        );

        if (files.length === 0) {

            return res.status(404).json({
                message: "Published career resource not found"
            });
        }

        // ==========================================
        // VERIFY PUBLIC COPY LOCATION
        // ==========================================

        const publicCopyRoot = path.resolve(
            process.cwd(),
            "uploads",
            "career-resources",
            "public-copies"
        );

        const filePath = path.resolve(
            process.cwd(),
            files[0].file_path
        );

        if (
            !filePath.startsWith(
                publicCopyRoot + path.sep
            )
        ) {

            return res.status(403).json({
                message: "Invalid document location"
            });
        }

        // ==========================================
        // VERIFY FILE EXISTS
        // ==========================================

        const fileStats = await fs.stat(filePath);

        if (
            !fileStats.isFile() ||
            fileStats.size <= 0 ||
            fileStats.size > 25 * 1024 * 1024
        ) {

            return res.status(400).json({
                message: "The public document is invalid"
            });
        }

        // ==========================================
        // VERIFY PDF SIGNATURE
        // ==========================================

        const fileHandle = await fs.open(filePath, "r");

        let signature;

        try {

            signature = Buffer.alloc(5);

            const { bytesRead } = await fileHandle.read(
                signature,
                0,
                5,
                0
            );

            if (
                bytesRead !== 5 ||
                signature.toString() !== "%PDF-"
            ) {

                return res.status(400).json({
                    message: "Invalid PDF document"
                });
            }

        } finally {

            await fileHandle.close();
        }

        // ==========================================
        // SEND PDF PREVIEW
        // ==========================================

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            'inline; filename="career-resource-preview.pdf"'
        );

        res.setHeader(
            "Cache-Control",
            "private, no-store"
        );

        res.setHeader(
            "X-Content-Type-Options",
            "nosniff"
        );

        return res.sendFile(filePath);

    } catch (error) {

        console.error(
            "Admin preview career resource error:",
            error
        );

        return res.status(500).json({
            message: "Unable to preview career resource"
        });
    }
};


// ==========================================
// ARCHIVE PUBLISHED RESOURCE
// ==========================================

const archiveCareerResource = async (req, res) => {

    try {

        const resourceId = Number(req.params.resourceId);

        // ----------------------------------
        // VALIDATE RESOURCE ID
        // ----------------------------------

        if (!Number.isInteger(resourceId) || resourceId <= 0) {

            return res.status(400).json({
                message: "Invalid resource ID"
            });
        }

        // ----------------------------------
        // ARCHIVE RESOURCE
        // ----------------------------------

        const [result] = await db.execute(
            `UPDATE career_resources
             SET status = 'archived'
             WHERE id = ?
             AND status = 'published'`,
            [resourceId]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Published resource not found"
            });
        }

        return res.status(200).json({
            message: "Career resource archived successfully",
            resourceId,
            status: "archived"
        });

    } catch (error) {

        console.error("Archive career resource error:", error);

        return res.status(500).json({
            message: "Unable to archive career resource"
        });
    }
};


module.exports = {
    getCareerResources,
    previewCareerResource,
    archiveCareerResource
};
