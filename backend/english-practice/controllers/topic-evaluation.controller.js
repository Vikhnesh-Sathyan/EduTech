
const topicEvaluationService = require(
    "../services/topic-evaluation.service"
);

const speakingAttemptService = require(
    "../services/speaking-attempt.service"
);


const evaluate = async (req, res) => {

    try {

        // 1. Validate attempt ID
        const attemptId = Number(req.body?.attempt_id);

        if (
            !Number.isInteger(attemptId) ||
            attemptId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid speaking attempt ID is required"
            });
        }

        const studentId = req.user.id;

        // 2. Fetch student's pending attempt
        const attempt =
            await speakingAttemptService.getAttemptForEvaluation(
                attemptId,
                studentId
            );

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Pending speaking attempt not found"
            });
        }

        // 3. Evaluate saved transcript using Python AI
        const result =
            await topicEvaluationService.evaluateTopicResponse(
                attempt.topic_title,
                attempt.transcript
            );

        // 4. Validate AI evaluation response
        const evaluation = result?.evaluation;

        const overallScore = Number(
            evaluation?.overall_score
        );

        if (
            result?.success !== true ||
            !evaluation ||
            !Number.isFinite(overallScore) ||
            overallScore < 0 ||
            overallScore > 10
        ) {
            throw new Error(
                "Invalid evaluation response from Python AI service"
            );
        }

        // 5. Save evaluation in database
        const saved =
            await speakingAttemptService.saveEvaluation(
                attemptId,
                studentId,
                {
                    ...evaluation,
                    overall_score: overallScore
                }
            );

        if (!saved) {
            return res.status(409).json({
                success: false,
                message: "Speaking attempt has already been evaluated"
            });
        }

        // 6. Return completed evaluation
        return res.status(200).json({
            success: true,
            attempt_id: attemptId,
            status: "completed",
            evaluation: {
                ...evaluation,
                overall_score: overallScore
            }
        });

    } catch (error) {

        console.error(
            "English Practice Topic Evaluation Error:",
            error.message
        );

        return res.status(503).json({
            success: false,
            message: error.message ||
                "Topic evaluation service is unavailable"
        });
    }
};


module.exports = {
    evaluate
};
