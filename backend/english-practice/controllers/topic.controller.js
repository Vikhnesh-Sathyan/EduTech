
const topicService = require("../services/topic.service");


const generate = async (req, res) => {

    try {

        const {
            category = null,
            difficulty = null
        } = req.body || {};


        // 1. Validate category
        if (
            category !== null &&
            (typeof category !== "string" || !category.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid topic category"
            });
        }


        // 2. Validate difficulty
        if (
            difficulty !== null &&
            (typeof difficulty !== "string" || !difficulty.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid topic difficulty"
            });
        }


        // 3. Fetch topics available to this student
        const studentId = req.user.id;

        const availableTopics =
            await topicService.getAvailableTopics(studentId);


        if (!availableTopics.length) {
            return res.status(404).json({
                success: false,
                message: "No speaking topics are available"
            });
        }


        // 4. Generate random topic
        const result = await topicService.generateTopic(
            availableTopics,
            category,
            difficulty
        );


        return res.status(200).json(result);

    } catch (error) {

        console.error(
            "English Practice Topic Generation Error:",
            error.message
        );

        return res.status(503).json({
            success: false,
            message: error.message ||
                "Topic generation service is unavailable"
        });
    }
};


module.exports = {
    generate
};
