
const JDOODLE_API_URL = "https://api.jdoodle.com/v1/execute";

const REQUEST_TIMEOUT = 30000;

const LANGUAGE_CONFIG = {
    python: {
        language: "python3",
        versionIndex: "6"
    },
    javascript: {
        language: "nodejs",
        versionIndex: "7"
    },
    java: {
        language: "java",
        versionIndex: "6"
    }
};

// =====================================================
// EXECUTE CODE THROUGH JDOODLE
// =====================================================

const executeCode = async (
    sourceCode,
    programmingLanguage,
    stdin = ""
) => {

    // -------------------------------------------------
    // VALIDATE SOURCE CODE
    // -------------------------------------------------

    if (
        typeof sourceCode !== "string" ||
        !sourceCode.trim()
    ) {
        throw new Error("Source code is required.");
    }

    // -------------------------------------------------
    // VALIDATE LANGUAGE
    // -------------------------------------------------

    if (
        typeof programmingLanguage !== "string" ||
        !programmingLanguage.trim()
    ) {
        throw new Error("Programming language is required.");
    }

    const languageConfig =
        LANGUAGE_CONFIG[programmingLanguage.trim().toLowerCase()];

    if (!languageConfig) {
        throw new Error("Unsupported programming language.");
    }

    // -------------------------------------------------
    // VALIDATE INPUT
    // -------------------------------------------------

    if (typeof stdin !== "string") {
        throw new Error("Standard input must be a string.");
    }

    // -------------------------------------------------
    // GET API CREDENTIALS
    // -------------------------------------------------

    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error(
            "JDoodle API credentials are not configured."
        );
    }

    // -------------------------------------------------
    // SEND EXECUTION REQUEST
    // -------------------------------------------------

    let response;

    try {

        response = await fetch(JDOODLE_API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                clientId,
                clientSecret,
                script: sourceCode,
                language: languageConfig.language,
                versionIndex: languageConfig.versionIndex,
                stdin
            }),

            signal: AbortSignal.timeout(REQUEST_TIMEOUT)
        });

    } catch (error) {

        if (error.name === "TimeoutError" ||
            error.name === "AbortError") {

            throw new Error(
                "JDoodle request timed out."
            );
        }

        throw new Error(
            "Unable to connect to JDoodle."
        );
    }

    // -------------------------------------------------
    // HANDLE API RESPONSE
    // -------------------------------------------------

    let result;

    try {

        result = await response.json();

    } catch (error) {

        throw new Error(
            "Invalid response received from JDoodle."
        );
    }

    // -------------------------------------------------
    // HANDLE HTTP ERRORS
    // -------------------------------------------------

    if (!response.ok) {

        if (response.status === 401) {
            throw new Error(
                "JDoodle authentication failed. Check API credentials."
            );
        }

        if (response.status === 429) {
            throw new Error(
                "JDoodle daily execution credits are exhausted."
            );
        }

        throw new Error(
            `JDoodle API request failed: ${response.status}`
        );
    }

    // -------------------------------------------------
    // RETURN EXECUTION RESULT
    // -------------------------------------------------

    return {
        output: result.output ?? "",
        statusCode: result.statusCode ?? null,
        error: result.error ?? null,
        memory: result.memory ?? null,
        cpuTime: result.cpuTime ?? null
    };
};

// =====================================================
// EXPORT SERVICE
// =====================================================

module.exports = {
    executeCode
};
