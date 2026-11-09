
const aiClient = require("./ai.service");


const generateProgressReport = async (sessions) => {

    try {

        const response = await aiClient.post(
            "/api/progress/report",
            {
                sessions
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
            throw new Error("Progress report request timed out");
        }

        if (error.response) {
            throw new Error(
                error.response.data.detail ||
                "Progress report generation failed"
            );
        }

        throw new Error(
            "Unable to communicate with Python AI service"
        );
    }
};


module.exports = {
    generateProgressReport
};
