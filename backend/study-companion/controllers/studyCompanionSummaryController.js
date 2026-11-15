const databaseService = require("../services/studyCompanionDatabaseService");
const aiService = require("../services/studyCompanionService");

 // ==========================================
// GENERATE FULL DOCUMENT SUMMARY
// ==========================================

const generateStudySummary = async (req, res) => {

    const studentId = req.user.id;
    const sessionUuid = req.params.sessionUuid;
    const { summary_type = "medium" } = req.body;

    const allowedTypes = ["short", "medium", "detailed"];

    if (!allowedTypes.includes(summary_type)) {
        return res.status(400).json({
            message: "Invalid summary type."
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
            ["deleted", "failed"].includes(session.sessionStatus)
        ) {
            return res.status(400).json({
                message: "This study session is not available."
            });
        }

        // 2. Generate summary using Python AI
        const aiResult = await aiService.generateSummary({
            session_id: sessionUuid,
            summary_type
        });

        if (
            !aiResult ||
            aiResult.success !== true ||
            typeof aiResult.summary !== "string" ||
            !aiResult.summary.trim()
        ) {
            throw new Error("Invalid summary response.");
        }

        // 3. Save summary permanently in MySQL
        const savedSummary = await databaseService.saveSummary({
            documentId: session.documentId,
            sessionId: session.sessionId,
            studentId,
            summaryType: "full",
            summaryContent: aiResult.summary
        });

        // 4. Return generated summary
        return res.status(200).json({
            message: "Document summary generated successfully.",
            summaryId: savedSummary.summaryId,
            summaryType: aiResult.summary_type,
            summary: aiResult.summary
        });

    } catch (error) {

        console.error(
            "Study Companion summary error:",
            error
        );

        return res.status(500).json({
            message: "Unable to generate document summary."
        });
    }
};


// ==========================================
// GENERATE SELECTED PAGE SUMMARY
// ==========================================

const generateStudyPageSummary = async (req, res) => {

    const studentId = req.user.id;
    const sessionUuid = req.params.sessionUuid;

    const {
        start_page,
        end_page,
        summary_type = "medium"
    } = req.body;

    const allowedTypes = ["short", "medium", "detailed"];

    if (
        !Number.isInteger(start_page) ||
        !Number.isInteger(end_page) ||
        start_page < 1 ||
        end_page < start_page ||
        !allowedTypes.includes(summary_type)
    ) {
        return res.status(400).json({
            message: "Invalid page summary request."
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
            ["deleted", "failed"].includes(session.sessionStatus)
        ) {
            return res.status(400).json({
                message: "This study session is not available."
            });
        }

        // 2. Validate requested pages against document length
        if (end_page > session.totalPages) {
            return res.status(400).json({
                message: "Requested pages exceed document length."
            });
        }

        // 3. Generate selected-page summary using Python
        const aiResult = await aiService.generatePageSummary({
            session_id: sessionUuid,
            start_page,
            end_page,
            summary_type
        });

        if (
            !aiResult ||
            aiResult.success !== true ||
            typeof aiResult.summary !== "string" ||
            !aiResult.summary.trim()
        ) {
            throw new Error("Invalid page summary response.");
        }

        // 4. Save page summary permanently in MySQL
        const savedSummary = await databaseService.saveSummary({
            documentId: session.documentId,
            sessionId: session.sessionId,
            studentId,
            summaryType: "page_wise",
            startPage: aiResult.start_page,
            endPage: aiResult.end_page,
            summaryContent: aiResult.summary
        });

        // 5. Return generated summary
        return res.status(200).json({
            message: "Page summary generated successfully.",
            summaryId: savedSummary.summaryId,
            summaryType: aiResult.summary_type,
            startPage: aiResult.start_page,
            endPage: aiResult.end_page,
            summary: aiResult.summary
        });

    } catch (error) {

        console.error(
            "Study Companion page summary error:",
            error
        );

        return res.status(500).json({
            message: "Unable to generate page summary."
        });
    }
};


// ==========================================
// GET SAVED STUDY SUMMARIES
// ==========================================

const getStudySummaries = async (req, res) => {

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
            ["deleted", "failed"].includes(session.sessionStatus)
        ) {
            return res.status(400).json({
                message: "This study session is not available."
            });
        }

        // 2. Retrieve summaries from MySQL
        const summaries = await databaseService.getSessionSummaries(
            session.sessionId,
            studentId
        );

        // 3. Return saved summaries
        return res.status(200).json({
            message: "Study summaries retrieved successfully.",
            summaries
        });

    } catch (error) {

        console.error(
            "Study Companion summaries retrieval error:",
            error
        );

        return res.status(500).json({
            message: "Unable to retrieve study summaries."
        });
    }
};



module.exports = {
    generateStudySummary,
    generateStudyPageSummary,
    getStudySummaries
};