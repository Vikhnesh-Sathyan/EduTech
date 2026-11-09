
const axios = require("axios");

const { AI_SERVICE_URL } = require("../config/ai.config");

const aiClient = axios.create({

    baseURL: AI_SERVICE_URL,

    timeout: 300000,

    transitional: {
        clarifyTimeoutError: true
    }

});

module.exports = aiClient;
