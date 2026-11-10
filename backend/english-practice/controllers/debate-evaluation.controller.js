
const debateEvaluationService = require(
    "../services/debate-evaluation.service"
);

const debateSessionService = require(
    "../services/debate-session.service"
);


const evaluate = async (req, res) => {

    try {

        const { sessionId } = req.body || {};

        // 1. Validate session ID
        if (
            !Number.isInteger(Number(sessionId)) ||
            Number(sessionId) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid debate session ID is required"
            });
        }

        // 2. Retrieve student's debate session
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

        // 3. Prevent duplicate evaluation
        if (session.status !== "active") {
            return res.status(409).json({
                success: false,
                message: "This debate session is already completed or abandoned"
            });
        }

        // 4. Get student arguments from database
        const studentArguments = session.arguments
            .map(item => item.student_argument)
            .filter(argument =>
                typeof argument === "string" &&
                argument.trim()
            );

        if (studentArguments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Submit at least one argument before evaluation"
            });
        }

        // 5. Request AI evaluation
        const result = await debateEvaluationService.evaluateDebate(
            session.topic,
            studentArguments
        );

        const evaluation = result?.evaluation;

        if (!evaluation) {
            throw new Error("AI returned an invalid evaluation");
        }

        // 6. Validate overall score
        const overallScore = Number(evaluation.overall_score);

        if (
            !Number.isFinite(overallScore) ||
            overallScore < 0 ||
            overallScore > 10
        ) {
            throw new Error("AI returned an invalid overall score");
        }

        // 7. Save evaluation and complete session
        const completed = await debateSessionService.completeSession({
            sessionId: session.id,
            overallScore,
            evaluationResult: evaluation
        });

        if (!completed) {
            return res.status(409).json({
                success: false,
                message: "Unable to complete this debate session"
            });
        }

        // 8. Return evaluation
        return res.status(200).json({
            success: true,
            message: "Debate evaluated successfully",
            sessionId: session.id,
            status: "completed",
            evaluation
        });

    } catch (error) {

        console.error(
            "Debate evaluation controller error:",
            error.message
        );

        return res.status(503).json({
            success: false,
            message: error.message ||
                "Debate evaluation service is unavailable"
        });
    }
};


module.exports = {
    evaluate
};
