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
                student_argument: studentArgument,
                history
            }
        );

        return response.data;

    } catch (error) {

        if (error.code === "ECONNREFUSED") {
            throw new Error("Python AI service is unavailable");
        }

        if (
            error.code === "ECONNABORTED" ||
            error.code === "ETIMEDOUT"
        ) {
            throw new Error("Python AI service request timed out");
        }

        if (error.response) {
            throw new Error(
                error.response.data.detail ||
                "Python AI service returned an error"
            );
        }

        throw new Error(
            "Unable to communicate with Python AI service"
        );
    }
};


module.exports = {
    sendDebateArgument
};