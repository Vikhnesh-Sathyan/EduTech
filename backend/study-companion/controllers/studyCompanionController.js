const databaseService = require("../services/studyCompanionDatabaseService");
const aiService = require("../services/studyCompanionService");
const storageService = require("../services/studyCompanionStorageService");

// ==========================================
// UPLOAD STUDY DOCUMENT
// ==========================================

const uploadStudyDocument = async (req, res) => {

    const studentId = req.user.id;

    let storedFile = null;
    let documentSession = null;

    if (!req.file) {
        return res.status(400).json({
            message: "Please upload a PDF document."
        });
    }

    try {

        // 1. Store original PDF permanently
        storedFile = await storageService.storePdf(req.file);

        // 2. Create document and session in MySQL
        documentSession = await databaseService.createDocumentAndSession({
            studentId,
            originalFilename: req.file.originalname,
            storedFilename: storedFile.storedFilename,
            filePath: storedFile.filePath,
            fileSize: storedFile.fileSize,
            mimeType: storedFile.mimeType
        });

        // 3. Mark document as processing
        await databaseService.updateDocumentStatus(
            documentSession.documentId,
            "processing"
        );

        // 4. Send PDF to Python AI
        const aiResult = await aiService.uploadPdf(
            req.file,
            documentSession.sessionUuid
        );

        // 5. Validate extracted content
        if (
            !Array.isArray(aiResult.pages) ||
            aiResult.pages.length === 0 ||
            !Array.isArray(aiResult.chunks) ||
            aiResult.chunks.length === 0
        ) {
            throw new Error("PDF extraction returned invalid content.");
        }

        // 6. Permanently save extracted pages
        await databaseService.saveDocumentPages(
            documentSession.documentId,
            studentId,
            aiResult.pages
        );

        // 7. Permanently save document chunks
        await databaseService.saveDocumentChunks(
            documentSession.documentId,
            studentId,
            aiResult.chunks
        );

        // 8. Mark document as completed
        await databaseService.updateDocumentStatus(
            documentSession.documentId,
            "completed",
            null,
            aiResult.pages.length
        );

        return res.status(201).json({
            message: "Study document uploaded successfully.",

            document: {
                documentId: documentSession.documentId,
                originalFilename: req.file.originalname,
                totalPages: aiResult.pages.length,
                processingStatus: "completed"
            },

            session: {
                sessionId: documentSession.sessionId,
                sessionUuid: documentSession.sessionUuid
            }
        });

    } catch (error) {

        console.error("Study Companion upload error:", error);

        // Mark failed records in MySQL
        if (documentSession) {

            try {
                await databaseService.updateDocumentStatus(
                    documentSession.documentId,
                    "failed",
                    error.message
                );

                await databaseService.updateSessionStatus(
                    documentSession.sessionId,
                    "failed"
                );

            } catch (databaseError) {
                console.error(
                    "Study Companion failure-status update error:",
                    databaseError
                );
            }

            // Remove temporary Python session if it was created
            try {
                await aiService.deleteSession(
                    documentSession.sessionUuid
                );
            } catch (pythonError) {
                console.error(
                    "Python session cleanup error:",
                    pythonError.message
                );
            }
        }

        // Remove stored PDF after failed processing
        if (storedFile) {

            try {
                await storageService.deletePdf(
                    storedFile.filePath
                );
            } catch (storageError) {
                console.error(
                    "PDF cleanup error:",
                    storageError
                );
            }
        }

        return res.status(500).json({
            message: "Failed to upload and process study document."
        });
    }
};


// ==========================================
// UPLOAD STUDY TEXT
// ==========================================

const uploadStudyText = async (req, res) => {

    const studentId = req.user.id;
    const { text } = req.body;

    if (
        typeof text !== "string" ||
        text.trim().length < 50 ||
        text.length > 1000000
    ) {
        return res.status(400).json({
            message: "Text must contain between 50 and 1,000,000 characters."
        });
    }

    let storedFile = null;
    let documentSession = null;

    try {

        const cleanText = text.trim();

        // 1. Convert text into a file buffer.
        const textBuffer = Buffer.from(cleanText, "utf8");

        const textFile = {
            buffer: textBuffer,
            size: textBuffer.length,
            mimetype: "text/plain"
        };

        // 2. Store text permanently.
        storedFile = await storageService.storeText(textFile);

        // 3. Create document and session in MySQL.
        documentSession = await databaseService.createDocumentAndSession({
            studentId,
            originalFilename: "study-notes.txt",
            storedFilename: storedFile.storedFilename,
            filePath: storedFile.filePath,
            fileSize: storedFile.fileSize,
            mimeType: storedFile.mimeType
        });

        // 4. Mark document as processing.
        await databaseService.updateDocumentStatus(
            documentSession.documentId,
            "processing"
        );

        // 5. Send text to Python using Node-generated UUID.
        const aiResult = await aiService.uploadText(
            cleanText,
            documentSession.sessionUuid
        );

        // 6. Validate processed content.
        if (
            !aiResult ||
            aiResult.success !== true ||
            !Array.isArray(aiResult.pages) ||
            aiResult.pages.length === 0 ||
            !Array.isArray(aiResult.chunks) ||
            aiResult.chunks.length === 0
        ) {
            throw new Error("Text processing returned invalid content.");
        }

        // 7. Save extracted pages permanently.
        await databaseService.saveDocumentPages(
            documentSession.documentId,
            studentId,
            aiResult.pages
        );

        // 8. Save document chunks permanently.
        await databaseService.saveDocumentChunks(
            documentSession.documentId,
            studentId,
            aiResult.chunks
        );

        // 9. Mark document as completed.
        await databaseService.updateDocumentStatus(
            documentSession.documentId,
            "completed",
            null,
            aiResult.pages.length
        );

        return res.status(201).json({
            message: "Study text uploaded successfully.",

            document: {
                documentId: documentSession.documentId,
                originalFilename: "study-notes.txt",
                totalPages: aiResult.pages.length,
                processingStatus: "completed"
            },

            session: {
                sessionId: documentSession.sessionId,
                sessionUuid: documentSession.sessionUuid
            }
        });

    } catch (error) {

        console.error("Study Companion text upload error:", error);

        // Mark failed records in MySQL.
        if (documentSession) {

            try {

                await databaseService.updateDocumentStatus(
                    documentSession.documentId,
                    "failed",
                    error.message
                );

                await databaseService.updateSessionStatus(
                    documentSession.sessionId,
                    "failed"
                );

            } catch (databaseError) {

                console.error(
                    "Text upload failure-status update error:",
                    databaseError
                );
            }

            // Remove Python session if created.
            try {

                await aiService.deleteSession(
                    documentSession.sessionUuid
                );

            } catch (pythonError) {

                console.error(
                    "Python session cleanup error:",
                    pythonError.message
                );
            }
        }

        // Remove stored text after failed processing.
        if (storedFile) {

            try {

                await storageService.deleteStoredFile(
                    storedFile.filePath
                );

            } catch (storageError) {

                console.error(
                    "Text cleanup error:",
                    storageError
                );
            }
        }

        return res.status(500).json({
            message: "Failed to upload and process study text."
        });
    }
};


// ==========================================
// RESTORE STUDY SESSION
// ==========================================

const restoreStudySession = async (req, res) => {

    const studentId = req.user.id;
    const sessionUuid = req.params.sessionUuid;

    try {

        // 1. Find session and verify student ownership
        const session = await databaseService.getSessionDocument(
            sessionUuid,
            studentId
        );

        if (!session) {
            return res.status(404).json({
                message: "Study session not found."
            });
        }

        // 2. Allow restoration only for successfully processed documents
        if (session.processingStatus !== "completed") {
            return res.status(400).json({
                message: "This document is not ready to be restored."
            });
        }

        if (
            session.sessionStatus === "deleted" ||
            session.sessionStatus === "failed"
        ) {
            return res.status(400).json({
                message: "This study session is no longer available."
            });
        }

        // 3. Fetch permanently saved pages from MySQL
        const pages = await databaseService.getDocumentPages(
            session.documentId,
            studentId
        );

        // 4. Fetch permanently saved chunks from MySQL
        const chunks = await databaseService.getDocumentChunks(
            session.documentId,
            studentId
        );

        if (!pages.length || !chunks.length) {
            return res.status(400).json({
                message: "Saved document content is incomplete."
            });
        }

        // 5. Restore session and rebuild FAISS in Python
        const restoreResult = await aiService.restoreSession(
            sessionUuid,
            pages,
            chunks
        );

        return res.status(200).json({
            message: "Study session restored successfully.",

            document: {
                documentId: session.documentId,
                originalFilename: session.originalFilename,
                totalPages: session.totalPages
            },

            session: {
                sessionId: session.sessionId,
                sessionUuid: session.sessionUuid,
                status: session.sessionStatus
            },

            restoration: {
                success: restoreResult.success,
                totalPages: restoreResult.total_pages,
                totalChunks: restoreResult.total_chunks
            }
        });

    } catch (error) {

        console.error(
            "Study Companion session restoration error:",
            error
        );

        return res.status(500).json({
            message: "Unable to restore the study session."
        });
    }
};


// ==========================================
// ASK STUDY DOCUMENT QUESTION
// ==========================================

const askStudyQuestion = async (req, res) => {

    const studentId = req.user.id;
    const sessionUuid = req.params.sessionUuid;
    const { question } = req.body;

    if (
        typeof question !== "string" ||
        !question.trim() ||
        question.length > 2000
    ) {
        return res.status(400).json({
            message: "Please enter a valid question."
        });
    }

    try {

        // 1. Verify session ownership
        const session = await databaseService.getSessionDocument(
            sessionUuid,
            studentId
        );

        if (!session) {
            return res.status(404).json({
                message: "Study session not found."
            });
        }

        if (
            session.processingStatus !== "completed" ||
            session.sessionStatus === "deleted" ||
            session.sessionStatus === "failed"
        ) {
            return res.status(400).json({
                message: "This study session is not available."
            });
        }

        // 2. Save student's question in MySQL
        await databaseService.saveMessage(
            session.sessionId,
            studentId,
            "user",
            question.trim()
        );

        // 3. Send question to Python AI
        const aiResult = await aiService.askQuestion({
            session_id: sessionUuid,
            question: question.trim()
        });

        if (
            !aiResult ||
            typeof aiResult.answer !== "string" ||
            !aiResult.answer.trim()
        ) {
            throw new Error("Invalid AI response.");
        }

        // 4. Save AI answer in MySQL
        await databaseService.saveMessage(
            session.sessionId,
            studentId,
            "assistant",
            aiResult.answer
        );

        // 5. Return answer to Angular
        return res.status(200).json({
            message: "Question answered successfully.",
            answer: aiResult.answer,
            sources: aiResult.sources || []
        });

    } catch (error) {

        console.error(
            "Study Companion question error:",
            error
        );

        return res.status(500).json({
            message: "Unable to answer your question."
        });
    }
};

// ==========================================
// GET STUDY CHAT HISTORY
// ==========================================

const getStudyChatHistory = async (req, res) => {

    const studentId = req.user.id;
    const sessionUuid = req.params.sessionUuid;

    try {

        // 1. Verify session ownership
        const session = await databaseService.getSessionDocument(
            sessionUuid,
            studentId
        );

        if (!session) {
            return res.status(404).json({
                message: "Study session not found."
            });
        }

        if (
            session.processingStatus !== "completed" ||
            session.sessionStatus === "deleted" ||
            session.sessionStatus === "failed"
        ) {
            return res.status(400).json({
                message: "This study session is not available."
            });
        }

        // 2. Retrieve saved messages from MySQL
        const messages = await databaseService.getSessionMessages(
            session.sessionId,
            studentId
        );

        // 3. Return chat history
        return res.status(200).json({
            message: "Chat history retrieved successfully.",
            messages
        });

    } catch (error) {

        console.error(
            "Study Companion chat history error:",
            error
        );

        return res.status(500).json({
            message: "Unable to retrieve chat history."
        });
    }
};


module.exports = {
    uploadStudyDocument,
    uploadStudyText,
    restoreStudySession,
    askStudyQuestion,
    getStudyChatHistory
};
