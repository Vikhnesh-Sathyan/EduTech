
const aiClient = require("./ai.service");


const evaluateTopicResponse = async (
    topic,
    transcript
) => {

    try {

        const response = await aiClient.post(
            "/api/topics/evaluate",
            {
                topic,
                transcript
            }
        );

        return response.data;

    } catch (error) {

        if (error.code === "ECONNREFUSED") {
            throw new Error(
                "Python AI service is unavailable"
            );
        }

        if (
            error.code === "ECONNABORTED" ||
            error.code === "ETIMEDOUT"
        ) {
            throw new Error(
                "Python AI service request timed out"
            );
        }

        if (error.response) {

            const detail = error.response.data?.detail;

            throw new Error(
                typeof detail === "string"
                    ? detail
                    : "Python AI service returned an error"
            );
        }

        throw new Error(
            "Unable to communicate with Python AI service"
        );
    }
};


module.exports = {
    evaluateTopicResponse
};
