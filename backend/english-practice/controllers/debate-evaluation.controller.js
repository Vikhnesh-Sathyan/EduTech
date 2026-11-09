
const debateEvaluationService = require(
    "../services/debate-evaluation.service"
);


const evaluate = async (req, res) => {

    try {

        const {
            topic,
            studentArguments
        } = req.body || {};

        // 1. Validate topic
        if (
            typeof topic !== "string" ||
            !topic.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid debate topic is required"
            });
        }

        // 2. Validate student arguments
        if (
            !Array.isArray(studentArguments) ||
            studentArguments.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Student debate arguments are required"
            });
        }

        // 3. Validate individual arguments
        const validArguments = studentArguments.every(
            (argument) =>
                typeof argument === "string" &&
                argument.trim()
        );

        if (!validArguments) {
            return res.status(400).json({
                success: false,
                message: "Invalid student debate arguments"
            });
        }

        // 4. Send arguments for AI evaluation
        const result = await debateEvaluationService.evaluateDebate(
            topic.trim(),
            studentArguments
        );

        // 5. Return evaluation
        return res.status(200).json(result);

    } catch (error) {

        console.error(
            "English Practice Debate Evaluation Error:",
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
