const conversationService = require("../services/conversation.service");


const chat = async (req, res) => {

    try {

        const { message, history = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const result = await conversationService.sendMessage(
            message,
            history
        );

        return res.status(200).json(result);

    } catch (error) {

        console.error(
            "English Practice Conversation Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to generate AI conversation response"
        });
    }
};


module.exports = {
    chat
};