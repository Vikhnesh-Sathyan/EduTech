const db = require("../../../../config/db");
const multer = require("multer");
const { parse } = require("csv-parse/sync");

// =====================================================
// CSV FILE UPLOAD CONFIGURATION
// =====================================================

const uploadCSV = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024 // 2 MB
    },
    fileFilter: (req, file, callback) => {
        const isCSV =
            file.mimetype === "text/csv" ||
            file.originalname.toLowerCase().endsWith(".csv");

        if (!isCSV) {
            return callback(new Error("Please upload a CSV file."));
        }

        callback(null, true);
    }
}).single("file");

// =====================================================
// CSV HELPERS
// =====================================================

const parseJSONColumn = (value, fallback, columnName) => {
    if (!value || !value.trim()) {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch {
        throw new Error(`Invalid JSON in ${columnName}.`);
    }
};

const isValidDate = (value) => {
    if (!value) return true;

    return !Number.isNaN(Date.parse(value));
};

// =====================================================
// IMPORT LOGIC TO CODE PROBLEMS FROM CSV
// =====================================================

const importProblemsFromCSV = (req, res) => {
    uploadCSV(req, res, async (uploadError) => {
        if (uploadError) {
            return res.status(400).json({
                message: uploadError.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please select a CSV file."
            });
        }

        const mentorId = Number(req.user?.id);

        if (!Number.isInteger(mentorId) || mentorId <= 0) {
            return res.status(401).json({
                message: "Invalid mentor account."
            });
        }

        try {
            // 1. Parse CSV
            const rows = parse(req.file.buffer, {
                columns: (headers) =>
                    headers.map((header) => header.trim()),
                skip_empty_lines: true,
                bom: true,
                trim: true,
                relax_column_count: false
            });

            if (rows.length === 0) {
                return res.status(400).json({
                    message: "The CSV file contains no problem rows."
                });
            }

            // 2. Validate headers
            const requiredHeaders = [
                "title",
                "description",
                "language",
                "mode",
                "difficulty",
                "max_marks",
                "hint_text",
                "input_description",
                "output_description",
                "examples_json",
                "starter_code",
                "solution_code",
                "algorithm_steps_json",
                "prediction_questions_json",
                "publish_date",
                "due_date"
            ];

            const headers = Object.keys(rows[0]);

            const missingHeaders = requiredHeaders.filter(
                (header) => !headers.includes(header)
            );

            if (missingHeaders.length > 0) {
                return res.status(400).json({
                    message: "The CSV is missing required columns.",
                    missingHeaders
                });
            }

            if (rows.length > 100) {
                return res.status(400).json({
                    message: "Import a maximum of 100 problems per CSV."
                });
            }

            // 3. Fetch active languages once
            const [languages] = await db.execute(
                `SELECT id, name
                 FROM subjects
                 WHERE status = 'active'`
            );

            const languageMap = new Map(
                languages.map((language) => [
                    language.name.trim().toLowerCase(),
                    language.id
                ])
            );

            const results = {
                imported: 0,
                failed: 0,
                errors: []
            };

            // 4. Process each problem independently
            for (let index = 0; index < rows.length; index++) {
                const row = rows[index];
                const rowNumber = index + 2;

                let connection;
                let transactionStarted = false;

                try {
                    const title = row.title?.trim();
                    const description = row.description?.trim();
                    const languageKey = row.language?.trim().toLowerCase();
                    const languageId = languageMap.get(languageKey);

                    const mode = row.mode || "build_code";
                    const difficulty = row.difficulty || "easy";
                    const maxMarks = Number(row.max_marks || 100);

                    if (!title || !description) {
                        throw new Error(
                            "Title and description are required."
                        );
                    }

                    if (!languageId) {
                        throw new Error(
                            `Unknown or inactive language: ${row.language}.`
                        );
                    }

                    if (
                        !["build_code", "understand_code"].includes(mode)
                    ) {
                        throw new Error("Invalid problem mode.");
                    }

                    if (!["easy", "medium", "hard"].includes(difficulty)) {
                        throw new Error("Invalid difficulty.");
                    }

                    if (
                        !Number.isFinite(maxMarks) ||
                        maxMarks <= 0 ||
                        maxMarks > 99999.99
                    ) {
                        throw new Error("Invalid maximum marks.");
                    }

                    const publishDate = row.publish_date || null;
                    const dueDate = row.due_date || null;

                    if (
                        !isValidDate(publishDate) ||
                        !isValidDate(dueDate)
                    ) {
                        throw new Error("Invalid publish or due date.");
                    }

                    if (
                        publishDate &&
                        dueDate &&
                        new Date(dueDate) < new Date(publishDate)
                    ) {
                        throw new Error(
                            "Due date cannot be earlier than publish date."
                        );
                    }

                    const examples = parseJSONColumn(
                        row.examples_json,
                        [],
                        "examples_json"
                    );

                    const algorithmSteps = parseJSONColumn(
                        row.algorithm_steps_json,
                        [],
                        "algorithm_steps_json"
                    );

                    const predictionQuestions = parseJSONColumn(
                        row.prediction_questions_json,
                        [],
                        "prediction_questions_json"
                    );

                    if (
                        !Array.isArray(examples) ||
                        !Array.isArray(algorithmSteps) ||
                        !Array.isArray(predictionQuestions)
                    ) {
                        throw new Error(
                            "Examples, algorithm steps and prediction questions must be JSON arrays."
                        );
                    }

                    const content = {
                        inputDescription: row.input_description || null,
                        outputDescription: row.output_description || null,
                        examples,
                        starterCode: row.starter_code || null,
                        solutionCode: row.solution_code || null,
                        algorithmSteps,
                        flowData: null,
                        predictionQuestions
                    };

                    // 5. Save problem and content atomically
                    connection = await db.getConnection();

                    await connection.beginTransaction();
                    transactionStarted = true;

                    const [problemResult] = await connection.execute(
                        `INSERT INTO code_logic_problems
                        (
                            mentor_id,
                            language_id,
                            title,
                            description,
                            mode,
                            difficulty,
                            max_marks,
                            hint_text,
                            publish_date,
                            due_date,
                            status
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
                        [
                            mentorId,
                            languageId,
                            title,
                            description,
                            mode,
                            difficulty,
                            maxMarks,
                            row.hint_text || null,
                            publishDate,
                            dueDate
                        ]
                    );

                    const problemId = problemResult.insertId;

                    await connection.execute(
                        `INSERT INTO code_logic_problem_content
                        (
                            problem_id,
                            input_description,
                            output_description,
                            examples,
                            starter_code,
                            solution_code,
                            algorithm_steps,
                            flow_data,
                            prediction_questions
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            problemId,
                            content.inputDescription,
                            content.outputDescription,
                            JSON.stringify(content.examples),
                            content.starterCode,
                            content.solutionCode,
                            JSON.stringify(content.algorithmSteps),
                            null,
                            JSON.stringify(content.predictionQuestions)
                        ]
                    );

                    await connection.commit();
                    transactionStarted = false;

                    results.imported++;

                } catch (error) {
                    if (connection && transactionStarted) {
                        try {
                            await connection.rollback();
                        } catch (rollbackError) {
                            console.error(
                                "CSV import rollback error:",
                                rollbackError
                            );
                        }
                    }

                    results.failed++;
                    results.errors.push({
                        row: rowNumber,
                        title: row.title || "",
                        message: error.message
                    });

                } finally {
                    if (connection) {
                        connection.release();
                    }
                }
            }

            return res.status(200).json({
                message: "CSV import processing completed.",
                ...results
            });

        } catch (error) {
            console.error("Logic to Code CSV import error:", error);

            return res.status(400).json({
                message:
                    "Unable to process the CSV. Check its format and column headers."
            });
        }
    });
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    importProblemsFromCSV
};