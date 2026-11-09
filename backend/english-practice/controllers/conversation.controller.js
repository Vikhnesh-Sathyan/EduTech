
const conversationService = require("../services/conversation.service");
const conversationDbService = require("../services/conversation-db.service");


// Create a new conversation session
const createSession = async (req, res) => {

    try {

        const studentId = req.user.id;

        const sessionId = await conversationDbService.createSession(
            studentId
        );

        return res.status(201).json({
            success: true,
            sessionId
        });

    } catch (error) {

        console.error("Create conversation session error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to create conversation session"
        });

    }

};


// Get all student conversation sessions
const getSessions = async (req, res) => {

    try {

        const studentId = req.user.id;

        const sessions = await conversationDbService.getStudentSessions(
            studentId
        );

        return res.status(200).json({
            success: true,
            sessions
        });

    } catch (error) {

        console.error("Get conversation sessions error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve conversation sessions"
        });

    }

};


// Get messages from a specific session
const getSessionMessages = async (req, res) => {

    try {

        const studentId = req.user.id;
        const sessionId = Number(req.params.sessionId);

        if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid session ID is required"
            });
        }

        const session = await conversationDbService.getSessionById(
            sessionId,
            studentId
        );

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Conversation session not found"
            });
        }

        const messages = await conversationDbService.getMessages(
            sessionId
        );

        return res.status(200).json({
            success: true,
            session,
            messages
        });

    } catch (error) {

        console.error("Get conversation messages error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve conversation messages"
        });

    }

};


// Complete an active conversation session
const completeSession = async (req, res) => {

    try {

        const studentId = req.user.id;
        const sessionId = Number(req.params.sessionId);

        if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid session ID is required"
            });
        }

        const completed = await conversationDbService.completeSession(
            sessionId,
            studentId
        );

        if (!completed) {
            return res.status(404).json({
                success: false,
                message: "Active conversation session not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Conversation completed successfully"
        });

    } catch (error) {

        console.error("Complete conversation error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to complete conversation"
        });

    }

};


// Send a message and receive an AI response
const chat = async (req, res) => {

    try {

        const studentId = req.user.id;

        const { sessionId, message } = req.body;

        const validSessionId = Number(sessionId);

        if (
            !Number.isSafeInteger(validSessionId) ||
            validSessionId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid session ID is required"
            });
        }

        if (
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid message is required"
            });
        }

        const session = await conversationDbService.getSessionById(
            validSessionId,
            studentId
        );

        if (!session || session.status !== "active") {
            return res.status(404).json({
                success: false,
                message: "Active conversation session not found"
            });
        }

        const messages = await conversationDbService.getMessages(
            validSessionId
        );

        const history = messages.map(item => ({
            role: item.role,
            content: item.content
        }));

        // Keep only the latest 30 messages for AI context
        const recentHistory = history.slice(-30);

        const result = await conversationService.sendMessage(
            message.trim(),
            recentHistory
        );

        if (
            !result ||
            result.success !== true ||
            typeof result.response !== "string" ||
            !result.response.trim()
        ) {
            throw new Error("Invalid response received from AI service");
        }

        await conversationDbService.saveConversationTurn(
            validSessionId,
            message.trim(),
            result.response.trim()
        );

        return res.status(200).json(result);

    } catch (error) {

        console.error(
            "English Practice Conversation Error:",
            error.message
        );

        return res.status(503).json({
            success: false,
            message: error.message ||
                "AI conversation service is unavailable"
        });

    }

};


module.exports = {
    createSession,
    getSessions,
    getSessionMessages,
    completeSession,
    chat
};
