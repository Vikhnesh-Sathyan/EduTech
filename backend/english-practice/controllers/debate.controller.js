const debateService = require("../services/debate.service");

const debateSessionService = require(
    "../services/debate-session.service"
);


const respond = async (req, res) => {

    try {

        const { sessionId, studentArgument } = req.body;

        // 1. Validate session ID
        if (!Number.isInteger(Number(sessionId)) || Number(sessionId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid debate session ID is required"
            });
        }

        // 2. Validate student argument
        if (
            typeof studentArgument !== "string" ||
            !studentArgument.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Student argument is required"
            });
        }

        // 3. Retrieve session and verify ownership
        const session = await debateSessionService.getStudentSessionById(
            Number(sessionId),
            req.user.id
        );

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Debate session not found"
            });
        }

        // 4. Only active sessions can continue
        if (session.status !== "active") {
            return res.status(409).json({
                success: false,
                message: "This debate session is no longer active"
            });
        }

        // 5. Reconstruct conversation history from database
        const history = [];

        for (const item of session.arguments) {

            history.push({
                role: "user",
                content: item.student_argument
            });

            if (item.ai_response) {
                history.push({
                    role: "model",
                    content: item.ai_response
                });
            }
        }

        // 6. Generate AI counterargument
        const result = await debateService.sendDebateArgument(
            session.topic,
            session.student_position,
            studentArgument.trim(),
            history
        );

        if (!result || !result.response) {
            throw new Error("AI returned an empty debate response");
        }

        // 7. Save conversation round in MySQL
        const sequenceNumber = session.arguments.length + 1;

        await debateSessionService.saveArgument({
            sessionId: session.id,
            sequenceNumber,
            studentArgument: studentArgument.trim(),
            aiResponse: result.response
        });

        // 8. Return saved conversation round
        return res.status(200).json({
            success: true,
            sessionId: session.id,
            sequenceNumber,
            aiPosition: result.ai_position,
            studentArgument: studentArgument.trim(),
            response: result.response
        });

    } catch (error) {

        console.error(
            "Debate response controller error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to process debate argument"
        });
    }
};



const createSession = async (req, res) => {

    try {

        const { topic, studentPosition } = req.body;

        if (
            typeof topic !== "string" ||
            !topic.trim() ||
            topic.trim().length > 300
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid debate topic is required"
            });
        }

        if (!["for", "against"].includes(studentPosition)) {
            return res.status(400).json({
                success: false,
                message: "Position must be for or against"
            });
        }

        const sessionId = await debateSessionService.createSession({
            studentId: req.user.id,
            topic: topic.trim(),
            studentPosition
        });

        return res.status(201).json({
            success: true,
            message: "Debate session created successfully",
            sessionId
        });

    } catch (error) {

        console.error("Create debate session error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to create debate session"
        });
    }
};


module.exports = {
    respond,
    createSession
};