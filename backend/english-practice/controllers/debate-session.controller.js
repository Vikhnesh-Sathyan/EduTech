
const debateSessionService = require(
    "../services/debate-session.service"
);


// ==========================================
// GET STUDENT DEBATE HISTORY
// ==========================================

const getHistory = async (req, res) => {

    try {

        const sessions = await debateSessionService.getStudentSessions(
            req.user.id
        );

        return res.status(200).json({
            success: true,
            sessions
        });

    } catch (error) {

        console.error(
            "Debate history error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load debate history"
        });
    }
};


// ==========================================
// GET INDIVIDUAL DEBATE SESSION
// ==========================================

const getSessionDetails = async (req, res) => {

    try {

        const sessionId = Number(req.params.sessionId);

        if (
            !Number.isInteger(sessionId) ||
            sessionId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid debate session ID"
            });
        }

        const session = await debateSessionService.getStudentSessionById(
            sessionId,
            req.user.id
        );

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Debate session not found"
            });
        }

        return res.status(200).json({
            success: true,
            session
        });

    } catch (error) {

        console.error(
            "Debate session details error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load debate session"
        });
    }
};

// ABANDON AN ACTIVE DEBATE SESSION
const abandonSession = async (req, res) => {

    try {

        const sessionId = Number(req.params.sessionId);

        if (!Number.isInteger(sessionId) || sessionId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid debate session ID"
            });
        }

        const abandoned = await debateSessionService.abandonSession({
            sessionId,
            studentId: req.user.id
        });

        if (!abandoned) {
            return res.status(404).json({
                success: false,
                message: "Active debate session not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Debate session abandoned successfully"
        });

    } catch (error) {

        console.error("Abandon debate error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to abandon debate session"
        });
    }
};

module.exports = {
    getHistory,
    getSessionDetails,
    abandonSession
};
