
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generateCodeAnimationSteps = async (code, programmingLanguage) => {
    if (!code || !code.trim()) {
        throw new Error("Code is required to generate animation steps.");
    }

    if (!programmingLanguage || !programmingLanguage.trim()) {
        throw new Error("Programming language is required.");
    }

    const prompt = `
You are a programming execution tutor for beginners.

Analyze the supplied ${programmingLanguage} code and generate
a step-by-step execution walkthrough.

Return ONLY a valid JSON array. Do not include Markdown fences.

Each item must contain:
- step_title: short beginner-friendly title
- explanation: explain what happens during this step
- code_line: actual 1-based code line number, or null
- variable_state: JSON object containing the variables and their values
  AFTER this step, or null if no variables are relevant
- action_type: one of initialize, input, assignment, comparison,
  loop, output, complete

Rules:
1. Follow the actual execution order of the code.
2. Include initialization, input, assignments, comparisons,
   loop iterations, output, and completion when applicable.
3. Show variable values after each step, not invented values.
4. Do not invent user input. If the code requires input and no input
   is provided, use symbolic input such as "user input required"
   and explain that the actual value depends on the input.
5. For hardcoded sample values, use those values accurately.
6. Use valid JSON values in variable_state.
7. Use actual code line numbers starting from 1.
8. Keep explanations short and suitable for beginners.
9. Include a final complete step.
10. Return between 1 and 100 steps. Do not repeat steps unnecessarily.

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

    if (!Array.isArray(steps) || steps.length === 0 || steps.length > 100) {
        throw new Error("Gemini returned invalid animation steps.");
    }

    const allowedActions = [
        "initialize",
        "input",
        "assignment",
        "comparison",
        "loop",
        "output",
        "complete"
    ];

    return steps.map((step, index) => {
        if (
            typeof step.step_title !== "string" ||
            !step.step_title.trim() ||
            typeof step.explanation !== "string" ||
            !step.explanation.trim() ||
            !allowedActions.includes(step.action_type)
        ) {
            throw new Error(
                `Invalid generated animation step ${index + 1}.`
            );
        }

        const codeLine = step.code_line == null
            ? null
            : Number(step.code_line);

        if (
            codeLine !== null &&
            (!Number.isInteger(codeLine) || codeLine <= 0)
        ) {
            throw new Error(
                `Invalid code line in animation step ${index + 1}.`
            );
        }

        if (
            step.variable_state != null &&
            (
                typeof step.variable_state !== "object" ||
                Array.isArray(step.variable_state)
            )
        ) {
            throw new Error(
                `Invalid variable state in animation step ${index + 1}.`
            );
        }

        return {
            step_title: step.step_title.trim(),
            explanation: step.explanation.trim(),
            code_line: codeLine,
            variable_state: step.variable_state ?? null,
            action_type: step.action_type
        };
    });
};

module.exports = {
    generateCodeAnimationSteps
};
