
const aiClient = require("./ai.service");


const sendMessage = async (message, history = []) => {

    try {

        const response = await aiClient.post(
            "/api/conversation/chat",
            {
                message,
                history
            }
        );

        return response.data;

    } catch (error) {

        // Python service is not running
        if (error.code === "ECONNREFUSED") {
            throw new Error("Python AI service is unavailable");
        }

        // Request timeout
        if (
            error.code === "ECONNABORTED" ||
            error.code === "ETIMEDOUT"
        ) {
            throw new Error("Python AI service request timed out");
        }

        // Python returned an error response
        if (error.response) {

            throw new Error(
                error.response.data?.detail ||
                "Python AI service returned an error"
            );

        }

        // Other communication errors
        throw new Error(
            "Unable to communicate with Python AI service"
        );

    }

};


module.exports = {
    sendMessage
};
