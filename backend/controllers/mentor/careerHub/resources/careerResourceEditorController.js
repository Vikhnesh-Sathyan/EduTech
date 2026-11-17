const db = require("../../../../config/db");
const fs = require("fs/promises");
const path = require("path");

const { PDFDocument } = require("pdf-lib");
const crypto = require("crypto");

const { imageSize } = require("image-size");

// ==========================================
// DELETE FILE
// ==========================================

const deleteUploadedFile = async (filePath) => {

    if (!filePath) return;

    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error("File cleanup failed:", error.message);
    }
};


const saveEditedCareerResource = async (req, res) => {

    let connection;
    let transactionStarted = false;
    let transactionCommitted = false;
    let newFilePath = null;

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
        // VALIDATE PAGE IMAGES
        // ==========================================

        const pageFiles = req.files;

        if (!Array.isArray(pageFiles) || pageFiles.length === 0) {

            return res.status(400).json({
                message: "Please upload edited PDF pages"
            });
        }

        if (pageFiles.length > 20) {

            return res.status(400).json({
                message: "Maximum 20 pages are allowed"
            });
        }

        // ==========================================
        // VALIDATE TOTAL IMAGE UPLOAD SIZE
        // ==========================================

        const totalImageSize = pageFiles.reduce(
            (total, file) => total + file.size,
            0
        );

        const MAX_TOTAL_IMAGE_SIZE = 20 * 1024 * 1024;

        if (totalImageSize > MAX_TOTAL_IMAGE_SIZE) {

            return res.status(400).json({
                message: "Total page images must not exceed 20 MB"
            });
        }

        // ==========================================
        // VALIDATE IMAGE SIGNATURES AND DIMENSIONS
        // ==========================================

        const pageDimensions = [];

        for (const file of pageFiles) {

            if (!file.buffer || !file.mimetype) {

                return res.status(400).json({
                    message: "Invalid page image"
                });
            }

            const buffer = file.buffer;

            const isPNG =
                file.mimetype === "image/png" &&
                buffer.length >= 8 &&
                buffer.subarray(0, 8).equals(
                    Buffer.from([
                        137, 80, 78, 71,
                        13, 10, 26, 10
                    ])
                );

            const isJPEG =
                file.mimetype === "image/jpeg" &&
                buffer.length >= 3 &&
                buffer[0] === 0xFF &&
                buffer[1] === 0xD8 &&
                buffer[2] === 0xFF;

            if (!isPNG && !isJPEG) {

                return res.status(400).json({
                    message: "Invalid PNG or JPEG page image"
                });
            }

            // --------------------------------------
            // READ IMAGE DIMENSIONS BEFORE EMBEDDING
            // --------------------------------------

            let dimensions;

            try {

                dimensions = imageSize(buffer);

            } catch (imageError) {

                return res.status(400).json({
                    message: "Unable to read page image dimensions"
                });
            }

            const width = dimensions.width;
            const height = dimensions.height;

            if (
                !Number.isFinite(width) ||
                !Number.isFinite(height) ||
                width <= 0 ||
                height <= 0 ||
                width > 5000 ||
                height > 5000 ||
                width * height > 12000000
            ) {

                return res.status(400).json({
                    message: "Invalid image dimensions. Maximum allowed size is 5000 × 5000 pixels and 12 million pixels per page."
                });
            }

            pageDimensions.push({
                width,
                height
            });
        }

        // ==========================================
        // GENERATE A FRESH PDF
        // ==========================================

        const pdfDocument = await PDFDocument.create();

        pdfDocument.setTitle("");
        pdfDocument.setAuthor("");
        pdfDocument.setSubject("");
        pdfDocument.setKeywords([]);
        pdfDocument.setCreator("EduTech");
        pdfDocument.setProducer("EduTech");

        for (let i = 0; i < pageFiles.length; i++) {

            const file = pageFiles[i];

            const { width, height } = pageDimensions[i];

            let embeddedImage;

            if (file.mimetype === "image/png") {

                embeddedImage = await pdfDocument.embedPng(
                    file.buffer
                );

            } else {

                embeddedImage = await pdfDocument.embedJpg(
                    file.buffer
                );
            }

            // ======================================
            // CREATE PAGE FROM IMAGE
            // ======================================

            const page = pdfDocument.addPage([
                width,
                height
            ]);

            page.drawImage(embeddedImage, {
                x: 0,
                y: 0,
                width,
                height
            });
        }

        // ==========================================
        // SAVE GENERATED PDF
        // ==========================================

        const pdfBytes = await pdfDocument.save();

        const MAX_GENERATED_PDF_SIZE = 25 * 1024 * 1024;

        if (pdfBytes.length > MAX_GENERATED_PDF_SIZE) {

            return res.status(400).json({
                message: "Generated PDF must not exceed 25 MB"
            });
        }

        // ==========================================
        // CREATE PRIVATE STORAGE PATH
        // ==========================================

        const publicCopyRoot = path.resolve(
            process.cwd(),
            "uploads",
            "career-resources",
            "public-copies"
        );

        await fs.mkdir(publicCopyRoot, {
            recursive: true
        });

        const generatedFileName =
            `career-resource-${resourceId}-${crypto.randomUUID()}.pdf`;

        newFilePath = path.join(
            publicCopyRoot,
            generatedFileName
        );

        await fs.writeFile(
            newFilePath,
            pdfBytes,
            { flag: "wx" }
        );

        const relativeFilePath = path
            .relative(process.cwd(), newFilePath)
            .replace(/\\/g, "/");

        // ==========================================
        // DATABASE TRANSACTION
        // ==========================================

        connection = await db.getConnection();

        await connection.beginTransaction();

        transactionStarted = true;

        // ==========================================
        // VERIFY RESOURCE OWNERSHIP
        // ==========================================

        const [resources] = await connection.execute(
            `SELECT id, status
             FROM career_resources
             WHERE id = ?
             AND created_by = ?
             FOR UPDATE`,
            [resourceId, req.user.id]
        );

        if (resources.length === 0) {

            await connection.rollback();

            transactionStarted = false;

            return res.status(404).json({
                message: "Career resource not found"
            });
        }

        const resource = resources[0];

        // ==========================================
        // CHECK RESOURCE STATUS
        // ==========================================

        if (
            !["processing", "awaiting_confirmation"].includes(
                resource.status
            )
        ) {

            await connection.rollback();

            transactionStarted = false;

            return res.status(409).json({
                message: "This resource cannot be edited"
            });
        }

        // ==========================================
        // GET EXISTING PUBLIC COPY
        // ==========================================

        const [existingFiles] = await connection.execute(
            `SELECT id, file_path
             FROM career_resource_files
             WHERE resource_id = ?
             AND file_type = 'public_copy'
             LIMIT 1`,
            [resourceId]
        );

        let oldFilePath = null;

        // ==========================================
        // UPDATE OR INSERT PUBLIC COPY
        // ==========================================

        if (existingFiles.length > 0) {

            oldFilePath = existingFiles[0].file_path;

            await connection.execute(
                `UPDATE career_resource_files
                 SET
                    file_path = ?,
                    file_name = ?,
                    mime_type = ?,
                    file_size = ?
                 WHERE id = ?`,
                [
                    relativeFilePath,
                    generatedFileName,
                    "application/pdf",
                    pdfBytes.length,
                    existingFiles[0].id
                ]
            );

        } else {

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
                VALUES (?, 'public_copy', ?, ?, ?, ?)`,
                [
                    resourceId,
                    relativeFilePath,
                    generatedFileName,
                    "application/pdf",
                    pdfBytes.length
                ]
            );
        }

        // ==========================================
        // UPDATE RESOURCE STATUS
        // ==========================================

        await connection.execute(
            `UPDATE career_resources
             SET status = 'awaiting_confirmation'
             WHERE id = ?`,
            [resourceId]
        );

        // ==========================================
        // COMMIT TRANSACTION
        // ==========================================

        await connection.commit();

        transactionStarted = false;
        transactionCommitted = true;

        // ==========================================
        // DELETE OLD PUBLIC COPY
        // ==========================================

        if (oldFilePath) {

            const oldAbsolutePath = path.resolve(
                process.cwd(),
                oldFilePath
            );

            if (
                oldAbsolutePath.startsWith(
                    publicCopyRoot + path.sep
                )
            ) {

                await deleteUploadedFile(oldAbsolutePath);
            }
        }

        return res.status(200).json({
            message: "Edited PDF generated successfully. Please preview and confirm publication.",
            resourceId,
            pageCount: pageFiles.length,
            status: "awaiting_confirmation"
        });

    } catch (error) {

        console.error(
            "Mentor Save edited career resource error:",
            error
        );

        // ==========================================
        // ROLLBACK TRANSACTION
        // ==========================================

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

        // ==========================================
        // DELETE NEW PDF IF SAVE FAILED
        // ==========================================

        if (!transactionCommitted && newFilePath) {

            await deleteUploadedFile(newFilePath);
        }

        return res.status(500).json({
            message: "Unable to generate edited PDF"
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
};


// ==========================================
// GET ORIGINAL CAREER RESOURCE
// ==========================================

const getOriginalCareerResource = async (req, res) => {
    try {
        const resourceId = Number(req.params.resourceId);

        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            return res.status(400).json({
                message: "Invalid resource ID"
            });
        }

        const [files] = await db.execute(
            `SELECT
                r.id,
                r.status,
                f.file_path,
                f.file_name
             FROM career_resources r
             INNER JOIN career_resource_files f
                ON r.id = f.resource_id
             WHERE r.id = ?
                AND r.created_by = ?
                AND f.file_type = 'original'
             LIMIT 1`,
            [resourceId, req.user.id]
        );

        if (files.length === 0) {
            return res.status(404).json({
                message: "Original document not found"
            });
        }

        const resource = files[0];

        if (!["processing", "awaiting_confirmation"].includes(resource.status)) {
            return res.status(409).json({
                message: "This resource cannot be edited"
            });
        }

        const originalRoot = path.resolve(
            process.cwd(),
            "uploads",
            "career-resources",
            "originals"
        );

        const originalPath = path.resolve(
            process.cwd(),
            resource.file_path
        );

        if (!originalPath.startsWith(originalRoot + path.sep)) {
            return res.status(403).json({
                message: "Invalid document location"
            });
        }

        await fs.access(originalPath);

        const safeFileName = path.basename(resource.file_name)
            .replace(/["\\]/g, "");

        return res.sendFile(
            originalPath,
            {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `inline; filename="${safeFileName}"`,
                    "Cache-Control": "private, no-store",
                    "X-Content-Type-Options": "nosniff"
                }
            },
            (error) => {
                if (error && !res.headersSent) {
                    console.error("Original PDF response error:", error);
                    res.status(500).json({
                        message: "Unable to open original PDF"
                    });
                }
            }
        );

    } catch (error) {
        console.error("Get original career resource error:", error);

        if (!res.headersSent) {
            return res.status(404).json({
                message: "Unable to access original document"
            });
        }
    }
};


// ==========================================
// EXPORT CONTROLLER
// ==========================================

module.exports = {
    saveEditedCareerResource,
    getOriginalCareerResource
};
