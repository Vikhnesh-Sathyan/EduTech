
const pool = require("../../config/db");
const { randomUUID } = require("crypto");

// ==========================================
// CREATE DOCUMENT AND SESSION
// ==========================================

const createDocumentAndSession = async ({
    studentId,
    originalFilename,
    storedFilename,
    filePath,
    fileSize,
    mimeType
}) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const [documentResult] = await connection.execute(
            `INSERT INTO study_companion_documents
            (
                student_id,
                original_filename,
                stored_filename,
                file_path,
                file_size,
                mime_type,
                processing_status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'uploaded')`,
            [
                studentId,
                originalFilename,
                storedFilename,
                filePath,
                fileSize,
                mimeType
            ]
        );

        const documentId = documentResult.insertId;
        const sessionUuid = randomUUID();

        const [sessionResult] = await connection.execute(
            `INSERT INTO study_companion_sessions
            (
                student_id,
                document_id,
                session_uuid,
                status
            )
            VALUES (?, ?, ?, 'active')`,
            [
                studentId,
                documentId,
                sessionUuid
            ]
        );

        await connection.commit();

        return {
            documentId,
            sessionId: sessionResult.insertId,
            sessionUuid
        };

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }
};

// ==========================================
// UPDATE DOCUMENT PROCESSING STATUS
// ==========================================

const updateDocumentStatus = async (
    documentId,
    status,
    errorMessage = null,
    totalPages = null
) => {
    const allowedStatuses = [
        "uploaded",
        "processing",
        "completed",
        "failed"
    ];

    if (!allowedStatuses.includes(status)) {
        throw new Error("Invalid document processing status.");
    }

    await pool.execute(
        `UPDATE study_companion_documents
         SET processing_status = ?,
             error_message = ?,
             total_pages = COALESCE(?, total_pages)
         WHERE id = ?`,
        [status, errorMessage, totalPages, documentId]
    );
};

// ==========================================
// GET SESSION AND DOCUMENT DETAILS
// ==========================================

const getSessionDocument = async (sessionUuid, studentId) => {

    const [rows] = await pool.execute(
        `SELECT
            s.id AS sessionId,
            s.session_uuid AS sessionUuid,
            s.status AS sessionStatus,
            d.id AS documentId,
            d.original_filename AS originalFilename,
            d.file_path AS filePath,
            d.total_pages AS totalPages,
            d.processing_status AS processingStatus
         FROM study_companion_sessions s
         INNER JOIN study_companion_documents d
            ON d.id = s.document_id
         WHERE s.session_uuid = ?
           AND s.student_id = ?
           AND d.student_id = ?
         LIMIT 1`,
        [sessionUuid, studentId, studentId]
    );

    return rows[0] || null;
};

// ==========================================
// GET ALL STUDENT STUDY DOCUMENTS
// ==========================================

const getStudentDocuments = async (studentId) => {

    const [rows] = await pool.execute(
        `SELECT
            d.id AS documentId,
            d.original_filename AS originalFilename,
            d.mime_type AS mimeType,
            d.total_pages AS totalPages,
            d.processing_status AS processingStatus,

            s.id AS sessionId,
            s.session_uuid AS sessionUuid,
            s.status AS sessionStatus

         FROM study_companion_documents d

         INNER JOIN study_companion_sessions s
            ON s.document_id = d.id

         WHERE d.student_id = ?
           AND s.student_id = ?

         ORDER BY d.id DESC`,
        [
            studentId,
            studentId
        ]
    );

    return rows;
};

// ==========================================
// UPDATE SESSION STATUS
// ==========================================

const updateSessionStatus = async (sessionId, status) => {

    const allowedStatuses = [
        "active",
        "completed",
        "failed",
        "deleted"
    ];

    if (!allowedStatuses.includes(status)) {
        throw new Error("Invalid session status.");
    }

    await pool.execute(
        `UPDATE study_companion_sessions
         SET status = ?
         WHERE id = ?`,
        [status, sessionId]
    );
};


// ==========================================
// SAVE EXTRACTED DOCUMENT PAGES
// ==========================================

const saveDocumentPages = async (
    documentId,
    studentId,
    pages
) => {

    if (!Array.isArray(pages) || pages.length === 0) {
        throw new Error("Document pages are required.");
    }

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const values = pages.map(page => {

            if (
                !Number.isInteger(page.page_number) ||
                page.page_number < 1 ||
                typeof page.content !== "string" ||
                !page.content.trim()
            ) {
                throw new Error("Invalid document page data.");
            }

            return [
                documentId,
                studentId,
                page.page_number,
                page.content
            ];
        });

        await connection.query(
            `INSERT INTO study_companion_document_pages
            (
                document_id,
                student_id,
                page_number,
                page_content
            )
            VALUES ?`,
            [values]
        );

        await connection.commit();

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }
};

// ==========================================
// GET SAVED DOCUMENT PAGES
// ==========================================

const getDocumentPages = async (documentId, studentId) => {

    const [rows] = await pool.execute(
        `SELECT
            page_number,
            page_content AS content
         FROM study_companion_document_pages
         WHERE document_id = ?
           AND student_id = ?
         ORDER BY page_number ASC`,
        [documentId, studentId]
    );

    return rows;
};

// ==========================================
// SAVE EXTRACTED DOCUMENT CHUNKS
// ==========================================

const saveDocumentChunks = async (
    documentId,
    studentId,
    chunks
) => {

    if (!Array.isArray(chunks) || chunks.length === 0) {
        throw new Error("Document chunks are required.");
    }

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const values = chunks.map((chunk, index) => [
            documentId,
            studentId,
            index,
            chunk.page_number,
            chunk.content
        ]);

        await connection.query(
            `INSERT INTO study_companion_document_chunks
            (
                document_id,
                student_id,
                chunk_index,
                page_number,
                chunk_content
            )
            VALUES ?`,
            [values]
        );

        await connection.commit();

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }
};

// ==========================================
// GET SAVED DOCUMENT CHUNKS
// ==========================================

const getDocumentChunks = async (documentId, studentId) => {

    const [rows] = await pool.execute(
        `SELECT
            chunk_index,
            page_number,
            chunk_content AS content
         FROM study_companion_document_chunks
         WHERE document_id = ?
           AND student_id = ?
         ORDER BY chunk_index ASC`,
        [documentId, studentId]
    );

    return rows;
};


// ==========================================
// SAVE CHAT MESSAGE
// ==========================================

const saveMessage = async (
    sessionId,
    studentId,
    messageType,
    messageContent
) => {

    const allowedTypes = ["user", "assistant"];

    if (!allowedTypes.includes(messageType)) {
        throw new Error("Invalid message type.");
    }

    if (
        typeof messageContent !== "string" ||
        !messageContent.trim()
    ) {
        throw new Error("Message content is required.");
    }

    const [result] = await pool.execute(
        `INSERT INTO study_companion_messages
        (
            session_id,
            student_id,
            message_type,
            message_content
        )
        VALUES (?, ?, ?, ?)`,
        [
            sessionId,
            studentId,
            messageType,
            messageContent.trim()
        ]
    );

    return {
        messageId: result.insertId
    };
};

// ==========================================
// GET SESSION CHAT HISTORY
// ==========================================

const getSessionMessages = async (
    sessionId,
    studentId
) => {

    const [rows] = await pool.execute(
        `SELECT
            id AS messageId,
            message_type AS messageType,
            message_content AS messageContent
         FROM study_companion_messages
         WHERE session_id = ?
           AND student_id = ?
         ORDER BY id ASC`,
        [sessionId, studentId]
    );

    return rows;
};


// ==========================================
// SAVE GENERATED SUMMARY
// ==========================================

const saveSummary = async ({
    documentId,
    sessionId,
    studentId,
    summaryType,
    startPage = null,
    endPage = null,
    summaryContent
}) => {

    const allowedTypes = [
        "full",
        "page_wise",
        "custom"
    ];

    if (!allowedTypes.includes(summaryType)) {
        throw new Error("Invalid summary type.");
    }

    if (
        typeof summaryContent !== "string" ||
        !summaryContent.trim()
    ) {
        throw new Error("Summary content is required.");
    }

    if (
        (startPage !== null && (!Number.isInteger(startPage) || startPage < 1)) ||
        (endPage !== null && (!Number.isInteger(endPage) || endPage < 1))
    ) {
        throw new Error("Invalid summary page range.");
    }

    if (
        (startPage === null) !== (endPage === null) ||
        (startPage !== null && endPage < startPage)
    ) {
        throw new Error("Invalid summary page range.");
    }

    const [result] = await pool.execute(
        `INSERT INTO study_companion_summaries
        (
            document_id,
            session_id,
            student_id,
            summary_type,
            start_page,
            end_page,
            summary_content
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            documentId,
            sessionId,
            studentId,
            summaryType,
            startPage,
            endPage,
            summaryContent.trim()
        ]
    );

    return {
        summaryId: result.insertId
    };
};

// ==========================================
// GET SESSION SUMMARIES
// ==========================================

const getSessionSummaries = async (
    sessionId,
    studentId
) => {

    const [rows] = await pool.execute(
        `SELECT
            id AS summaryId,
            summary_type AS summaryType,
            start_page AS startPage,
            end_page AS endPage,
            summary_content AS summaryContent,
            created_at AS createdAt
         FROM study_companion_summaries
         WHERE session_id = ?
           AND student_id = ?
         ORDER BY created_at DESC`,
        [
            sessionId,
            studentId
        ]
    );

    return rows;
};


// ==========================================
// SAVE GENERATED IMPORTANT POINTS
// ==========================================

const saveImportantPoints = async ({
    documentId,
    sessionId,
    studentId,
    points
}) => {

    if (!Array.isArray(points)) {
        throw new Error("Important points must be an array.");
    }

    const values = points.map(point => {

        const pointTitle = point.point_title ?? null;
        const pointContent = point.point_content;
        const pageNumber = point.page_number ?? null;

        if (
            pointTitle !== null &&
            (
                typeof pointTitle !== "string" ||
                pointTitle.length > 500
            )
        ) {
            throw new Error("Invalid important point title.");
        }

        if (
            typeof pointContent !== "string" ||
            !pointContent.trim()
        ) {
            throw new Error("Important point content is required.");
        }

        if (
            pageNumber !== null &&
            (!Number.isInteger(pageNumber) || pageNumber < 1)
        ) {
            throw new Error("Invalid important point page number.");
        }

        return [
            documentId,
            sessionId,
            studentId,
            pointTitle ? pointTitle.trim() : null,
            pointContent.trim(),
            pageNumber
        ];
    });

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        // Replace previously generated points for this session.
        await connection.execute(
            `DELETE FROM study_companion_important_points
             WHERE session_id = ?
               AND student_id = ?`,
            [sessionId, studentId]
        );

        // Insert the newly generated points.
        if (values.length > 0) {

            await connection.query(
                `INSERT INTO study_companion_important_points
                (
                    document_id,
                    session_id,
                    student_id,
                    point_title,
                    point_content,
                    page_number
                )
                VALUES ?`,
                [values]
            );
        }

        await connection.commit();

        return {
            savedCount: values.length
        };

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }
};


// ==========================================
// GET SESSION IMPORTANT POINTS
// ==========================================

const getSessionImportantPoints = async (
    sessionId,
    studentId
) => {

    const [rows] = await pool.execute(
        `SELECT
            id AS pointId,
            point_title AS pointTitle,
            point_content AS pointContent,
            page_number AS pageNumber,
            created_at AS createdAt
         FROM study_companion_important_points
         WHERE session_id = ?
           AND student_id = ?
         ORDER BY
            page_number IS NULL ASC,
            page_number ASC,
            id ASC`,
        [
            sessionId,
            studentId
        ]
    );

    return rows;
};


module.exports = {
    createDocumentAndSession,
    updateDocumentStatus,
    getSessionDocument,
    getStudentDocuments,
    updateSessionStatus,
    saveDocumentPages,
    getDocumentPages,
    saveDocumentChunks,
    getDocumentChunks,
    saveMessage,
    getSessionMessages,
    saveSummary,
    getSessionSummaries,
    saveImportantPoints,
    getSessionImportantPoints
};
