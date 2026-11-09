
const aiClient = require("./ai.service");


const transcribeAudio = async (file) => {

    try {

        const formData = new FormData();

        const audioBlob = new Blob(
            [file.buffer],
            { type: file.mimetype }
        );

        formData.append(
            "file",
            audioBlob,
            file.originalname
        );

        const response = await aiClient.post(
            "/api/speech/transcribe",
            formData
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
            throw new Error("Speech transcription request timed out");
        }

        if (error.response) {
            throw new Error(
                error.response.data.detail ||
                "Speech transcription failed"
            );
        }

        throw new Error(
            "Unable to communicate with Python AI service"
        );
    }
};


module.exports = {
    transcribeAudio
};
