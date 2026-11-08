const aiClient = require("./ai.service");


const sendMessage = async (message, history = []) => {

    const response = await aiClient.post(
        "/api/conversation/chat",
        {
            message,
            history
        }
    );

    return response.data;
};


module.exports = {
    sendMessage
};