
// =====================================================
// CLASSIFY JDOODLE EXECUTION RESULT
// =====================================================

const classifyExecutionResult = (programmingLanguage, result) => {

    const language = String(
        programmingLanguage || ""
    ).toLowerCase();

    // VALIDATE JDOODLE RESPONSE

    if (
        !result ||
        typeof result !== "object" ||
        typeof result.output !== "string" ||
        result.statusCode !== 200
    ) {
        return {
            status: "internal_error",
            output: ""
        };
    }

    const output = result.output;

    // PYTHON ERROR DETECTION

    if (language === "python") {

        if (
            /\b(SyntaxError|IndentationError|TabError)\b/.test(output)
        ) {
            return {
                status: "compilation_error",
                output
            };
        }

        if (
            /Traceback \(most recent call last\):/.test(output)
        ) {
            return {
                status: "runtime_error",
                output
            };
        }
    }

    // JAVASCRIPT ERROR DETECTION

    if (language === "javascript") {

        if (/SyntaxError:/.test(output)) {
            return {
                status: "compilation_error",
                output
            };
        }

        if (
            /\b(TypeError|ReferenceError|RangeError|URIError|EvalError):/.test(output) ||
            /\bError:/.test(output)
        ) {
            return {
                status: "runtime_error",
                output
            };
        }
    }

    // JAVA ERROR DETECTION

    if (language === "java") {

        if (
            /\berror:/.test(output) ||
            /reached end of file while parsing/.test(output)
        ) {
            return {
                status: "compilation_error",
                output
            };
        }

        if (
            /Exception in thread/.test(output) ||
            /\bCaused by:/.test(output) ||
            /\bError:/.test(output)
        ) {
            return {
                status: "runtime_error",
                output
            };
        }
    }

    // SUCCESSFUL EXECUTION

    return {
        status: "success",
        output
    };
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    classifyExecutionResult
};
