
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

        console.error("Speech Service Error:", error);

        console.error("Error code:", error?.code);
        console.error("Error message:", error?.message);
        console.error("Error cause:", error?.cause);
        console.error("Error response:", error?.response?.data);

        throw new Error(
            `Speech service failed: ${
                error?.message || String(error)
            }`
        );
    }
};

module.exports = { transcribeAudio };
