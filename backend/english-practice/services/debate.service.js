const aiClient = require("./ai.service");


const sendDebateArgument = async (
    topic,
    studentPosition,
    studentArgument,
    history = []
) => {

    try {

        const response = await aiClient.post(
            "/api/debate/respond",
            {
                topic,
                student_position: studentPosition,
                argument: studentArgument,
                history
            }
        );

        return response.data;

    }   catch (error) {

        if (error.code === "ECONNREFUSED") {
            throw new Error(
                "Python AI service is unavailable. Please check whether it is running."
            );
        }

        if (
            error.code === "ECONNABORTED" ||
            error.code === "ETIMEDOUT"
        ) {
            console.error("Python AI request timeout:", error.message);

            throw new Error(
                "The AI is taking too long to respond. Please try again."
            );
        }

        if (error.response) {

            console.error(
                "Python AI error:",
                error.response.status,
                error.response.data
            );

            throw new Error(
                error.response.data.detail ||
                error.response.data.message ||
                "Python AI service returned an error"
            );
        }

        console.error("AI communication error:", error);

        throw new Error(
            "Unable to communicate with Python AI service"
        );
    }
};


module.exports = {
    sendDebateArgument
};