
const { parse } = require("csv-parse/sync");

const REQUIRED_HEADERS = [
    "question_text",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct_option",
    "explanation",
    "concept_tag",
    "marks"
];

const validateTheoryQuizCsv = (csvText) => {
    const errors = [];
    let rows = [];

    if (typeof csvText !== "string" || !csvText.trim()) {
        return {
            valid: false,
            errors: ["CSV file is empty"],
            rows: []
        };
    }

    try {
        rows = parse(csvText, {
            bom: true,
            columns: (headers) =>
                headers.map((header) => header.trim()),
            skip_empty_lines: true,
            trim: true,
            relax_column_count: false
        });
    } catch (error) {
        return {
            valid: false,
            errors: [`CSV parsing failed: ${error.message}`],
            rows: []
        };
    }

    if (rows.length === 0) {
        return {
            valid: false,
            errors: ["CSV must contain a header and at least one question"],
            rows: []
        };
    }

    const actualHeaders = Object.keys(rows[0]);

    const missingHeaders = REQUIRED_HEADERS.filter(
        (header) => !actualHeaders.includes(header)
    );

    const unexpectedHeaders = actualHeaders.filter(
        (header) => !REQUIRED_HEADERS.includes(header)
    );

    if (missingHeaders.length || unexpectedHeaders.length) {
        return {
            valid: false,
            errors: [
                ...(missingHeaders.length
                    ? [`Missing columns: ${missingHeaders.join(", ")}`]
                    : []),
                ...(unexpectedHeaders.length
                    ? [`Unexpected columns: ${unexpectedHeaders.join(", ")}`]
                    : [])
            ],
            rows: []
        };
    }

    if (rows.length > 200) {
        return {
            valid: false,
            errors: ["A CSV file can contain at most 200 questions"],
            rows: []
        };
    }

    const normalizedRows = [];
    const seenQuestions = new Set();

    rows.forEach((row, index) => {
        const rowNumber = index + 2;
        const question = (row.question_text || "").trim();

        const optionA = (row.option_a || "").trim();
        const optionB = (row.option_b || "").trim();
        const optionC = (row.option_c || "").trim();
        const optionD = (row.option_d || "").trim();

        const correctOption = (row.correct_option || "")
            .trim()
            .toUpperCase();

        const marksText = (row.marks || "").trim();
        const marks = Number(marksText);

        const options = [optionA, optionB, optionC, optionD];

        if (!question) {
            errors.push(`Row ${rowNumber}: question_text is required`);
        }

        if (options.some((option) => !option)) {
            errors.push(`Row ${rowNumber}: all four options are required`);
        }

        if (
            options.every(Boolean) &&
            new Set(options.map((option) => option.toLowerCase())).size !== 4
        ) {
            errors.push(`Row ${rowNumber}: options must be different`);
        }

        if (!["A", "B", "C", "D"].includes(correctOption)) {
            errors.push(
                `Row ${rowNumber}: correct_option must be A, B, C, or D`
            );
        }

        if (
            !marksText ||
            !Number.isFinite(marks) ||
            marks <= 0 ||
            !Number.isInteger(marks * 100)
        ) {
            errors.push(
                `Row ${rowNumber}: marks must be a positive number with at most two decimal places`
            );
        }

        const normalizedQuestion = question.toLowerCase();

        if (question && seenQuestions.has(normalizedQuestion)) {
            errors.push(`Row ${rowNumber}: duplicate question`);
        }

        if (question) {
            seenQuestions.add(normalizedQuestion);
        }

        if (question && options.every(Boolean) &&
            ["A", "B", "C", "D"].includes(correctOption) &&
            marksText &&
            Number.isFinite(marks) &&
            marks > 0 &&
            Number.isInteger(marks * 100)
        ) {
            normalizedRows.push({
                question_text: question,
                options: options.map((option, optionIndex) => ({
                    option_text: option,
                    is_correct:
                        ["A", "B", "C", "D"][optionIndex] === correctOption
                            ? 1
                            : 0,
                    display_order: optionIndex + 1
                })),
                explanation: (row.explanation || "").trim() || null,
                concept_tag: (row.concept_tag || "").trim() || null,
                marks,
                display_order: rowNumber - 1
            });
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        rows: errors.length === 0 ? normalizedRows : []
    };
};

module.exports = { validateTheoryQuizCsv };
