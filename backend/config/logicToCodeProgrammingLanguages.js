// =====================================================
// PROGRAMMING LANGUAGE CONFIGURATION
// =====================================================

const programmingLanguages = {

    javascript: {
        label: "JavaScript",
        executionLanguage: "javascript",
        enabled: true
    },

    python: {
        label: "Python",
        executionLanguage: "python",
        enabled: true
    },

    java: {
        label: "Java",
        executionLanguage: "java",
        enabled: true
    }

};

// =====================================================
// SUBJECT TO PROGRAMMING LANGUAGE MAPPING
// =====================================================

const subjectLanguageMap = {
    "javascript": "javascript",
    "js": "javascript",
    "react.js": "javascript",

    "python": "python",

    "java": "java"
};

// =====================================================
// GET LANGUAGE FROM SUBJECT NAME
// =====================================================

const getLanguageFromSubject = (subjectName) => {

    if (!subjectName || typeof subjectName !== "string") {
        return null;
    }

    const normalizedSubject = subjectName
        .trim()
        .toLowerCase();

    const languageKey = subjectLanguageMap[normalizedSubject];

    if (!languageKey) {
        return null;
    }

    const language = programmingLanguages[languageKey];

    if (!language || !language.enabled) {
        return null;
    }

    return language;

};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    programmingLanguages,
    getLanguageFromSubject
};