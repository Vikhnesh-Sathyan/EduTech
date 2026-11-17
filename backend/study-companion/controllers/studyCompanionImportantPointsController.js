
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
        let aiResult;

        try {

            aiResult = await aiService.getImportantPoints(
                sessionUuid
            );

        } catch (error) {

            console.error(
                "Important points AI service error:",
                error.response?.data || error.message
            );

            // Preserve Python AI service status
            if (error.response?.status === 503) {
                return res.status(503).json({
                    message:
                        error.response.data?.detail ||
                        "AI service is temporarily busy. Please try again shortly."
                });
            }

            if (error.response?.status === 400 ||
                error.response?.status === 404) {

                return res.status(error.response.status).json({
                    message:
                        error.response.data?.detail ||
                        "Unable to process this study session."
                });
            }

            return res.status(502).json({
                message: "Unable to communicate with the AI service."
            });

        }

        // 3. Validate AI response
        if (
            !aiResult ||
            aiResult.success !== true ||
            !Array.isArray(aiResult.important_points)
        ) {
            return res.status(502).json({
                message: "Invalid response received from AI service."
            });
        }

        // 4. Save important points in MySQL
        const savedPoints = await databaseService.saveImportantPoints({
            documentId: session.documentId,
            sessionId: session.sessionId,
            studentId,
            points: aiResult.important_points
        });

        // 5. Return generated points
        return res.status(200).json({
            message: "Important points generated successfully.",
            savedCount: savedPoints.savedCount,
            importantPoints: aiResult.important_points
        });

    } 
catch (error) {

    console.error("IMPORTANT POINTS AI ERROR:", {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        errorCode: error.code,
        hasResponse: !!error.response
    });

    if (error.response) {

        return res.status(error.response.status).json({
            message:
                error.response.data?.detail ||
                error.response.data?.message ||
                "AI service request failed."
        });

    }

    if (error.code === "ECONNABORTED") {

        return res.status(504).json({
            message: "AI service request timed out."
        });

    }

    return res.status(502).json({
        message: "Unable to connect to the AI service."
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
