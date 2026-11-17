const db = require("../../../../config/db");
const fs = require("fs/promises");
const path = require("path");

const { PDFDocument } = require("pdf-lib");

// ==========================================
// DELETE UPLOADED FILE WHEN SOMETHING FAILS
// ==========================================

const deleteUploadedFile = async (filePath) => {

    if (!filePath) return;

    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error("Uploaded file cleanup failed:", error.message);
    }
};


// ==========================================
// UPLOAD CAREER RESOURCE
// ==========================================


const uploadCareerResource = async (req, res) => {

    let connection;
    let transactionStarted = false;

    const uploadedFilePath = req.file?.path;

    try {

        const {
            resource_type,
            title,
            country_id,
            experience_level,
            description
        } = req.body;

        // Validate uploaded file

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a PDF document"
            });
        }

        // Validate required details

        if (
            !["resume", "cover_letter"].includes(resource_type) ||
            typeof title !== "string" ||
            !title.trim() ||
            !country_id ||
            !["fresher", "experienced"].includes(experience_level)
        ) {
            await deleteUploadedFile(uploadedFilePath);

            return res.status(400).json({
                message: "Please provide valid resource details"
            });
        }

        // Validate country ID

        const countryId = Number(country_id);

        if (!Number.isInteger(countryId) || countryId <= 0) {
            await deleteUploadedFile(uploadedFilePath);

            return res.status(400).json({
                message: "Invalid country"
            });
        }

        // Validate description

        if (
            description !== undefined &&
            description !== null &&
            typeof description !== "string"
        ) {
            await deleteUploadedFile(uploadedFilePath);

            return res.status(400).json({
                message: "Invalid description"
            });
        }

        // Check active country

        const [countries] = await db.execute(
            `SELECT id
             FROM career_countries
             WHERE id = ?
             AND is_active = 1`,
            [countryId]
        );

        if (countries.length === 0) {
            await deleteUploadedFile(uploadedFilePath);

            return res.status(400).json({
                message: "Selected country is unavailable"
            });
        }

        // Validate PDF signature

        const fileHandle = await fs.open(uploadedFilePath, "r");

        let header;

        try {
            header = Buffer.alloc(5);
            await fileHandle.read(header, 0, 5, 0);
        } finally {
            await fileHandle.close();
        }

        if (header.toString() !== "%PDF-") {
            await deleteUploadedFile(uploadedFilePath);

            return res.status(400).json({
                message: "Uploaded file is not a valid PDF"
            });
        }

        // Prepare file details

        const relativeFilePath = path
            .relative(process.cwd(), uploadedFilePath)
            .replace(/\\/g, "/");

        // Start database transaction

        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        // Insert career resource

        const [resourceResult] = await connection.execute(
            `INSERT INTO career_resources
            (
                resource_type,
                title,
                country_id,
                experience_level,
                description,
                created_by,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'processing')`,
            [
                resource_type,
                title.trim(),
                countryId,
                experience_level,
                description?.trim() || null,
                req.user.id
            ]
        );

        const resourceId = resourceResult.insertId;

        // Insert original file record

        await connection.execute(
            `INSERT INTO career_resource_files
            (
                resource_id,
                file_type,
                file_path,
                file_name,
                mime_type,
                file_size
            )
            VALUES (?, 'original', ?, ?, ?, ?)`,
            [
                resourceId,
                relativeFilePath,
                path.basename(req.file.originalname),
                req.file.mimetype,
                req.file.size
            ]
        );

        // Commit transaction

        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            message: "Document uploaded successfully. It is awaiting secure processing.",
            resourceId,
            status: "processing"
        });

    } catch (error) {

        console.error("Career resource upload error:", error);

        if (connection && transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Transaction rollback failed:",
                    rollbackError.message
                );
            }
        }

        await deleteUploadedFile(uploadedFilePath);

        return res.status(500).json({
            message: "Unable to upload career resource"
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
};



// ==========================================
// GET MY CAREER RESOURCES
// ==========================================

const getMyCareerResources = async (req, res) => {

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
                cr.status,
                cr.publication_confirmed_at,
                cr.created_at,
                cr.updated_at,

                EXISTS (
                    SELECT 1
                    FROM career_resource_files crf
                    WHERE crf.resource_id = cr.id
                    AND crf.file_type = 'public_copy'
                ) AS has_public_copy

            FROM career_resources cr

            LEFT JOIN career_countries cc
                ON cc.id = cr.country_id

            WHERE cr.created_by = ?

            ORDER BY cr.created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            message: "Your career resources fetched successfully",
            total: resources.length,
            resources
        });

    } catch (error) {

        console.error("Mentor my career resources error:", error);

        return res.status(500).json({
            message: "Unable to fetch your career resources"
        });
    }
};


const previewAnonymizedCopy = async (req, res) => {

    try {

        const resourceId = Number(req.params.resourceId);

        if (!Number.isInteger(resourceId) || resourceId <= 0) {

            return res.status(400).json({
                message: "Invalid resource ID"
            });
        }

        // ==========================================
        // VERIFY OWNERSHIP AND RESOURCE STATUS
        // ==========================================

        const [files] = await db.execute(
            `SELECT
                cr.id,
                cr.title,
                cr.status,
                crf.file_path,
                crf.file_name

            FROM career_resources cr

            INNER JOIN career_resource_files crf
                ON crf.resource_id = cr.id

            WHERE cr.id = ?
            AND cr.created_by = ?
            AND crf.file_type = 'public_copy'
            AND cr.status = 'awaiting_confirmation'

            LIMIT 1`,
            [resourceId, req.user.id]
        );

        if (files.length === 0) {

            return res.status(404).json({
                message: "Anonymized preview not found"
            });
        }

        // ==========================================
        // RESOLVE AND VALIDATE PRIVATE FILE PATH
        // ==========================================

        const uploadRoot = path.resolve(
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
            !filePath.startsWith(uploadRoot + path.sep)
        ) {

            return res.status(403).json({
                message: "Invalid document location"
            });
        }

        // ==========================================
        // CHECK FILE EXISTS
        // ==========================================

        try {

            await fs.access(filePath);

        } catch (error) {

            return res.status(404).json({
                message: "Preview document is unavailable"
            });
        }

        // ==========================================
        // SEND PRIVATE PDF PREVIEW
        // ==========================================

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            'inline; filename="anonymized-preview.pdf"'
        );

        res.setHeader(
            "Cache-Control",
            "private, no-store"
        );

        res.setHeader(
            "X-Content-Type-Options",
            "nosniff"
        );

        return res.sendFile(
            filePath,
            (error) => {

                if (error && !res.headersSent) {

                    console.error(
                        "PDF preview response error:",
                        error
                    );

                    res.status(500).json({
                        message: "Unable to load document preview"
                    });
                }
            }
        );

    } catch (error) {

        console.error(
            "Anonymized preview error:",
            error
        );

        return res.status(500).json({
            message: "Unable to load document preview"
        });
    }
};

// ==========================================
// CONFIRM RESOURCE PUBLICATION
// ==========================================

const confirmResourcePublication = async (req, res) => {

    try {

        const resourceId = Number(req.params.resourceId);

        const { confirm_anonymization } = req.body;

        // ==========================================
        // VALIDATE RESOURCE ID
        // ==========================================

        if (!Number.isInteger(resourceId) || resourceId <= 0) {

            return res.status(400).json({
                message: "Invalid resource ID"
            });
        }

        if (confirm_anonymization !== true) {

            return res.status(400).json({
                message: "Please confirm that the document has been anonymized"
            });
        }

        // ==========================================
        // VERIFY OWNERSHIP AND PUBLIC COPY
        // ==========================================

        const [files] = await db.execute(
            `SELECT
                cr.id,
                cr.status,
                crf.file_path

             FROM career_resources cr

             INNER JOIN career_resource_files crf
                ON crf.resource_id = cr.id

             WHERE cr.id = ?
             AND cr.created_by = ?
             AND cr.status = 'awaiting_confirmation'
             AND crf.file_type = 'public_copy'

             LIMIT 1`,
            [resourceId, req.user.id]
        );

        if (files.length === 0) {

            return res.status(404).json({
                message: "Resource awaiting confirmation was not found"
            });
        }

        // ==========================================
        // VERIFY PUBLIC COPY LOCATION
        // ==========================================

        const uploadRoot = path.resolve(
            process.cwd(),
            "uploads",
            "career-resources",
            "public-copies"
        );

        const filePath = path.resolve(
            process.cwd(),
            files[0].file_path
        );

        if (!filePath.startsWith(uploadRoot + path.sep)) {

            return res.status(403).json({
                message: "Invalid document location"
            });
        }

        // ==========================================
        // VERIFY FILE EXISTS AND SIZE
        // ==========================================

        const fileStats = await fs.stat(filePath);

        if (!fileStats.isFile() || fileStats.size <= 0) {

            return res.status(400).json({
                message: "The anonymized document is invalid"
            });
        }

        const MAX_GENERATED_PDF_SIZE = 25 * 1024 * 1024;

        if (fileStats.size > MAX_GENERATED_PDF_SIZE) {

            return res.status(400).json({
                message: "The anonymized PDF must not exceed 25 MB"
            });
        }

        // ==========================================
        // VERIFY PDF CONTENT
        // ==========================================

        const pdfBuffer = await fs.readFile(filePath);

        if (pdfBuffer.subarray(0, 5).toString() !== "%PDF-") {

            return res.status(400).json({
                message: "The anonymized document is invalid"
            });
        }

        let pdfDocument;

        try {

            pdfDocument = await PDFDocument.load(pdfBuffer, {
                updateMetadata: false
            });

        } catch (pdfError) {

            return res.status(400).json({
                message: "The anonymized PDF cannot be opened or is corrupted"
            });
        }

        // ==========================================
        // VALIDATE PAGE COUNT
        // ==========================================

        const pageCount = pdfDocument.getPageCount();

        if (pageCount < 1 || pageCount > 20) {

            return res.status(400).json({
                message: "The anonymized PDF has an invalid page count"
            });
        }

        // ==========================================
        // PUBLISH RESOURCE
        // ==========================================

        const [result] = await db.execute(
            `UPDATE career_resources
             SET
                status = 'published',
                publication_confirmed_at = CURRENT_TIMESTAMP

             WHERE id = ?
             AND created_by = ?
             AND status = 'awaiting_confirmation'

             AND EXISTS (
                SELECT 1
                FROM career_resource_files
                WHERE resource_id = career_resources.id
                AND file_type = 'public_copy'
                AND file_path = ?
             )`,
            [
                resourceId,
                req.user.id,
                files[0].file_path
            ]
        );

        if (result.affectedRows === 0) {

            return res.status(409).json({
                message: "Resource could not be published. Please refresh and try again."
            });
        }

        return res.status(200).json({
            message: "Your anonymized resource has been published successfully",
            resourceId,
            pageCount,
            status: "published"
        });

    } catch (error) {

        console.error(
            "Mentor confirm resource publication error:",
            error
        );

        return res.status(500).json({
            message: "Unable to publish career resource"
        });
    }
};

module.exports = {
    uploadCareerResource,
    getMyCareerResources,
    previewAnonymizedCopy,
    confirmResourcePublication

};
