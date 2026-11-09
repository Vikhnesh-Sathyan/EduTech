
const topicEvaluationService = require(
    "../services/topic-evaluation.service"
);

const speakingAttemptService = require(
    "../services/speaking-attempt.service"
);


const evaluate = async (req, res) => {

    let attemptId;
    let studentId;
    let attempt;

    try {

        // 1. Validate attempt ID
        attemptId = Number(req.body?.attempt_id);

        if (
            !Number.isInteger(attemptId) ||
            attemptId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid speaking attempt ID is required"
            });
        }

        studentId = req.user.id;

        // 2. Fetch student's pending attempt
        attempt =
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

        let evaluation;

        // 3. Evaluate transcript using Python AI
        try {

            const result =
                await topicEvaluationService.evaluateTopicResponse(
                    attempt.topic_title,
                    attempt.transcript
                );

            // 4. Validate AI evaluation response
            evaluation = result?.evaluation;

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

            evaluation = {
                ...evaluation,
                overall_score: overallScore
            };

        } catch (evaluationError) {

            // Mark attempt as failed when AI evaluation fails
            await speakingAttemptService.markAttemptFailed(
                attemptId,
                studentId
            );

            throw evaluationError;
        }

        // 5. Save completed evaluation
        const saved =
            await speakingAttemptService.saveEvaluation(
                attemptId,
                studentId,
                evaluation
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
            evaluation
        });

    } catch (error) {

        console.error(
            "English Practice Topic Evaluation Error:",
            error.message
        );

        return res.status(503).json({
            success: false,
            message: "Unable to complete topic evaluation"
        });
    }
};


module.exports = {
    evaluate
};
