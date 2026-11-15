
const databaseService = require("../services/studyCompanionDatabaseService");
const aiService = require("../services/studyCompanionService");

// ==========================================
// GENERATE AND SAVE IMPORTANT POINTS
// ==========================================

const generateStudyImportantPoints = async (req, res) => {

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

        // 2. Generate important points using Python AI
        const aiResult = await aiService.getImportantPoints(
            sessionUuid
        );

        if (
            !aiResult ||
            aiResult.success !== true ||
            !Array.isArray(aiResult.important_points)
        ) {
            throw new Error("Invalid important points response.");
        }

        // 3. Save important points permanently in MySQL
        const savedPoints = await databaseService.saveImportantPoints({
            documentId: session.documentId,
            sessionId: session.sessionId,
            studentId,
            points: aiResult.important_points
        });

        // 4. Return generated points
        return res.status(200).json({
            message: "Important points generated successfully.",
            savedCount: savedPoints.savedCount,
            importantPoints: aiResult.important_points
        });

    } catch (error) {

        console.error(
            "Study Companion important points error:",
            error
        );

        return res.status(500).json({
            message: "Unable to generate important points."
        });
    }
};


// ==========================================
// GET SAVED IMPORTANT POINTS
// ==========================================

const getStudyImportantPoints = async (req, res) => {

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

        // 2. Retrieve saved points from MySQL
        const importantPoints = await databaseService.getSessionImportantPoints(
            session.sessionId,
            studentId
        );

        // 3. Return saved points
        return res.status(200).json({
            message: "Important points retrieved successfully.",
            importantPoints
        });

    } catch (error) {

        console.error(
            "Study Companion important points retrieval error:",
            error
        );

        return res.status(500).json({
            message: "Unable to retrieve important points."
        });
    }
};


module.exports = {
    generateStudyImportantPoints,
    getStudyImportantPoints
};
