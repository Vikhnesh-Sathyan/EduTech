
const aiClient = require("./ai.service");


const evaluateDebate = async (
    topic,
    studentArguments
) => {

    try {

        const response = await aiClient.post(
            "/api/debate/evaluate",
            {
                topic,
                student_arguments: studentArguments
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
    evaluateDebate
};
