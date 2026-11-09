
const speechService = require("../services/speech.service");

const speakingAttemptService = require(
    "../services/speaking-attempt.service"
);

const topicService = require("../services/topic.service");


const transcribe = async (req, res) => {

    try {

        const file = req.file;

        // 1. Validate uploaded audio
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Audio file is required"
            });
        }

        // 2. Validate topic ID
        const topicId = Number(req.body.topic_id);

        if (!Number.isInteger(topicId) || topicId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid topic ID is required"
            });
        }

        // 3. Check topic availability
        const availableTopics =
            await topicService.getAvailableTopics(req.user.id);

        const selectedTopic = availableTopics.find(
            topic => Number(topic.id) === topicId
        );

        if (!selectedTopic) {
            return res.status(404).json({
                success: false,
                message: "Speaking topic is unavailable"
            });
        }

        // 4. Transcribe audio
        const result = await speechService.transcribeAudio(file);

        if (!result.success) {
            return res.status(503).json({
                success: false,
                message: "Speech transcription failed"
            });
        }

        // 5. Save speaking attempt
        const attempt = await speakingAttemptService.saveAttempt({
            studentId: req.user.id,
            topicId: selectedTopic.id,
            topicTitle: selectedTopic.title,
            speechResult: result
        });

        return res.status(200).json({
            ...result,
            attempt
        });

    }  catch (error) {

        console.error("English Practice Speech Error:", error);

        console.error("Error message:", error?.message);
        console.error("Error stack:", error?.stack);
        console.error("Error response:", error?.response?.data);

        return res.status(500).json({
            success: false,
            message: "Unable to process speaking attempt",
            error: error?.message || String(error)
        });
    }
};


// Get student's speaking attempt history
const getHistory = async (req, res) => {

    try {

        const attempts =
            await speakingAttemptService.getStudentAttempts(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            attempts
        });

    } catch (error) {

        console.error(
            "English Speaking History Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch speaking history"
        });
    }
};


module.exports = {
    transcribe,
    getHistory
};
