
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generateAlgorithmSteps = async (code, programmingLanguage) => {
    if (!code || !code.trim()) {
        throw new Error("Code is required to generate algorithm steps.");
    }

    if (!programmingLanguage || !programmingLanguage.trim()) {
        throw new Error("Programming language is required.");
    }

    const prompt = `
You are a programming instructor.

Analyze the following ${programmingLanguage} code and generate
clear, beginner-friendly algorithm steps in execution order.

Return ONLY a valid JSON array. Do not include Markdown fences.

Each array item must contain:
- step_title: short title
- step_description: clear explanation
- step_type: one of start, input, process, condition, output, loop, end
- code_line_start: starting code line number, or null
- code_line_end: ending code line number, or null

Use accurate line numbers based on the supplied code.
Include a start step and an end step.

Code:
${code}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    const responseText = response.text;

    if (!responseText) {
        throw new Error("Gemini returned an empty response.");
    }

    const cleanedText = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    const steps = JSON.parse(cleanedText);

    if (!Array.isArray(steps) || steps.length === 0) {
        throw new Error("Gemini returned an invalid algorithm.");
    }

    const allowedTypes = [
        "start",
        "input",
        "process",
        "condition",
        "output",
        "loop",
        "end"
    ];

    return steps.map((step, index) => {
        if (
            typeof step.step_title !== "string" ||
            !step.step_title.trim() ||
            typeof step.step_description !== "string" ||
            !step.step_description.trim() ||
            !allowedTypes.includes(step.step_type)
        ) {
            throw new Error(`Invalid generated algorithm step ${index + 1}.`);
        }

        return {
            step_title: step.step_title.trim(),
            step_description: step.step_description.trim(),
            step_type: step.step_type,
            code_line_start: step.code_line_start ?? null,
            code_line_end: step.code_line_end ?? null
        };
    });
};

module.exports = {
    generateAlgorithmSteps
};
