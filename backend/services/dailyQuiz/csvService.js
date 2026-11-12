
const csvParser = require("csv-parser");
const { Readable } = require("stream");

// ==========================================
// REQUIRED CSV COLUMNS
// ==========================================

const REQUIRED_COLUMNS = [
    "question_text",
    "option_a",
    "option_b",
    "option_c",
    "correct_option"
];

// ==========================================
// VALIDATE CSV ROW
// ==========================================

const validateQuestionRow = (row, rowNumber) => {
    const errors = [];

    const questionText = row.question_text?.trim();
    const optionA = row.option_a?.trim();
    const optionB = row.option_b?.trim();
    const optionC = row.option_c?.trim();
    const correctOption = row.correct_option?.trim().toUpperCase();

    if (!questionText) {
        errors.push("Question text is required");
    }

    if (!optionA) {
        errors.push("Option A is required");
    }

    if (!optionB) {
        errors.push("Option B is required");
    }

    if (!optionC) {
        errors.push("Option C is required");
    }

    if (
        optionA &&
        optionB &&
        optionC &&
        new Set([optionA, optionB, optionC]).size !== 3
    ) {
        errors.push("All three options must be unique");
    }

    if (!["A", "B", "C"].includes(correctOption)) {
        errors.push("correct_option must be A, B or C");
    }

    return {
        row_number: rowNumber,
        valid: errors.length === 0,
        errors,
        data: {
            question_text: questionText,
            options: [
                {
                    option_text: optionA,
                    is_correct: correctOption === "A"
                },
                {
                    option_text: optionB,
                    is_correct: correctOption === "B"
                },
                {
                    option_text: optionC,
                    is_correct: correctOption === "C"
                }
            ]
        }
    };
};

// ==========================================
// PARSE AND VALIDATE CSV BUFFER
// ==========================================

const validateCsvBuffer = (buffer) => {
    return new Promise((resolve, reject) => {

        const rows = [];
        const headers = [];

        const parser = csvParser({
            mapHeaders: ({ header }) => header.trim().toLowerCase()
        });

        parser.on("headers", (receivedHeaders) => {
            headers.push(...receivedHeaders);
        });

        parser.on("data", (row) => {
            rows.push(row);
        });

        parser.on("error", reject);

        parser.on("end", () => {
            try {

                // CHECK REQUIRED COLUMNS

                const missingColumns = REQUIRED_COLUMNS.filter(
                    column => !headers.includes(column)
                );

                if (missingColumns.length > 0) {
                    return resolve({
                        success: false,
                        message: "CSV is missing required columns",
                        missing_columns: missingColumns,
                        total_rows: 0,
                        valid_rows: [],
                        invalid_rows: []
                    });
                }

                // CHECK EMPTY CSV

                if (rows.length === 0) {
                    return resolve({
                        success: false,
                        message: "CSV contains no questions",
                        total_rows: 0,
                        valid_count: 0,
                        invalid_count: 0,
                        valid_rows: [],
                        invalid_rows: []
                    });
                }

                const validRows = [];
                const invalidRows = [];

                // VALIDATE EACH ROW

                rows.forEach((row, index) => {

                    const result = validateQuestionRow(
                        row,
                        index + 2
                    );

                    if (result.valid) {
                        validRows.push(result);
                    } else {
                        invalidRows.push(result);
                    }

                });

                // CHECK DUPLICATE QUESTIONS INSIDE CSV

                const seenQuestions = new Set();

                for (
                    let index = validRows.length - 1;
                    index >= 0;
                    index--
                ) {

                    const item = validRows[index];

                    const normalizedQuestion = item.data.question_text
                        .toLowerCase()
                        .replace(/\s+/g, " ");

                    if (seenQuestions.has(normalizedQuestion)) {

                        item.valid = false;

                        item.errors.push(
                            "Duplicate question in CSV"
                        );

                        invalidRows.push(item);

                        validRows.splice(index, 1);

                    } else {

                        seenQuestions.add(normalizedQuestion);

                    }

                }

                // FINAL VALIDATION RESULT

                return resolve({
                    success: true,
                    message: "CSV validation completed",
                    total_rows: rows.length,
                    valid_count: validRows.length,
                    invalid_count: invalidRows.length,
                    valid_rows: validRows,
                    invalid_rows: invalidRows
                });

            } catch (error) {
                reject(error);
            }
        });

        Readable.from([buffer]).pipe(parser);

    });
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    validateCsvBuffer
};
