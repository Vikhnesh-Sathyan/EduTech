const db = require("../../config/db");
const XLSX = require("xlsx");

// ==========================================
// CREATE DIAGNOSTIC QUESTION
// ==========================================

const createDiagnosticQuestion = async (req, res) => {
    try {

        const {
            subjectId,
            topicId,
            question,
            code,
            optionA,
            optionB,
            optionC,
            optionD,
            correctOption,
            difficulty
        } = req.body;


        // Check required fields
        if (
            !subjectId ||
            !topicId ||
            !question ||
            !optionA ||
            !optionB ||
            !optionC ||
            !optionD ||
            !correctOption ||
            !difficulty
        ) {
            return res.status(400).json({
                message: "All question fields are required"
            });
        }


        // Check that topic belongs to the selected subject
        const topicSql = `
            SELECT id
            FROM subject_topics
            WHERE id = ?
              AND subject_id = ?
              AND status = 'active'
        `;

        const [topicResult] = await db.query(
            topicSql,
            [topicId, subjectId]
        );


        if (topicResult.length === 0) {
            return res.status(400).json({
                message:
                    "Selected topic does not belong to this subject"
            });
        }


        // Insert question
        const questionSql = `
            INSERT INTO diagnostic_questions (
                subject_id,
                topic_id,
                question,
                code,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                difficulty
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(
            questionSql,
            [
                subjectId,
                topicId,
                question,
                code || null,
                optionA,
                optionB,
                optionC,
                optionD,
                correctOption,
                difficulty
            ]
        );


        res.status(201).json({
            message:
                "Diagnostic question created successfully",
            questionId: result.insertId
        });

    } catch (error) {

        console.error(
            "Create diagnostic question error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create diagnostic question"
        });
    }
};


// ==========================================
// UPDATE DIAGNOSTIC QUESTION
// ==========================================

const updateDiagnosticQuestion = async (req, res) => {

    try {

        const { questionId } = req.params;

        const {
            subjectId,
            topicId,
            question,
            code,
            optionA,
            optionB,
            optionC,
            optionD,
            correctOption,
            difficulty
        } = req.body;


        // Check required fields
        if (
            !questionId ||
            !subjectId ||
            !topicId ||
            !question ||
            !optionA ||
            !optionB ||
            !optionC ||
            !optionD ||
            !correctOption ||
            !difficulty
        ) {
            return res.status(400).json({
                message:
                    "All question fields are required"
            });
        }


        // Check that topic belongs to selected subject
        const topicSql = `
            SELECT id
            FROM subject_topics
            WHERE id = ?
              AND subject_id = ?
              AND status = 'active'
        `;

        const [topicResult] = await db.query(
            topicSql,
            [topicId, subjectId]
        );


        if (topicResult.length === 0) {
            return res.status(400).json({
                message:
                    "Selected topic does not belong to this subject"
            });
        }


        // Check that question exists
        const questionCheckSql = `
            SELECT id
            FROM diagnostic_questions
            WHERE id = ?
        `;

        const [questionResult] = await db.query(
            questionCheckSql,
            [questionId]
        );


        if (questionResult.length === 0) {
            return res.status(404).json({
                message:
                    "Diagnostic question not found"
            });
        }


        // Update question
        const updateSql = `
            UPDATE diagnostic_questions
            SET
                subject_id = ?,
                topic_id = ?,
                question = ?,
                code = ?,
                option_a = ?,
                option_b = ?,
                option_c = ?,
                option_d = ?,
                correct_option = ?,
                difficulty = ?
            WHERE id = ?
        `;

        await db.query(
            updateSql,
            [
                subjectId,
                topicId,
                question,
                code || null,
                optionA,
                optionB,
                optionC,
                optionD,
                correctOption,
                difficulty,
                questionId
            ]
        );


        res.status(200).json({
            message:
                "Diagnostic question updated successfully"
        });

    } catch (error) {

        console.error(
            "Update diagnostic question error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update diagnostic question"
        });
    }
};


// ==========================================
// GET DIAGNOSTIC QUESTIONS
// ==========================================

const getDiagnosticQuestions = async (req, res) => {
    try {

        const sql = `
            SELECT
                dq.id,
                dq.subject_id,
                s.name AS subject_name,
                dq.topic_id,
                st.name AS topic_name,
                dq.question,
                dq.code,
                dq.option_a,
                dq.option_b,
                dq.option_c,
                dq.option_d,
                dq.correct_option,
                dq.difficulty,
                dq.status,
                dq.created_at
            FROM diagnostic_questions dq

            INNER JOIN subjects s
                ON s.id = dq.subject_id

            INNER JOIN subject_topics st
                ON st.id = dq.topic_id

            ORDER BY dq.created_at DESC
        `;

        const [questions] = await db.query(sql);

        res.status(200).json({
            questions
        });

    } catch (error) {

        console.error(
            "Get diagnostic questions error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to load diagnostic questions"
        });
    }
};


// ==========================================
// GET SUBJECTS FOR DIAGNOSTIC MANAGEMENT
// ==========================================

const getDiagnosticSubjects = async (req, res) => {
    try {

        const sql = `
            SELECT
                id,
                name
            FROM subjects
            WHERE status = 'active'
            ORDER BY name ASC
        `;

        const [subjects] = await db.query(sql);

        res.status(200).json({
            subjects
        });

    } catch (error) {

        console.error(
            "Get diagnostic subjects error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to load subjects"
        });
    }
};



// ==========================================
// GET TOPICS FOR A SUBJECT
// ==========================================

const getDiagnosticTopics = async (req, res) => {
    try {

        const { subjectId } = req.params;

        const sql = `
            SELECT
                id,
                name
            FROM subject_topics
            WHERE subject_id = ?
              AND status = 'active'
            ORDER BY display_order ASC, name ASC
        `;

        const [topics] = await db.query(
            sql,
            [subjectId]
        );

        res.status(200).json({
            topics
        });

    } catch (error) {

        console.error(
            "Get diagnostic topics error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to load topics"
        });
    }
};


const importDiagnosticQuestions = async (req, res) => {
    let connection;

    try {
        const { subjectId, topicId } = req.body;

        // 1. Validate the uploaded file and selected topic
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload an Excel or CSV file"
            });
        }

        if (!subjectId || !topicId) {
            return res.status(400).json({
                message: "Please select a subject and topic"
            });
        }

        // Confirm the file has the expected content type by parsing it.
        const extension = require("path")
            .extname(req.file.originalname)
            .toLowerCase();

        if (![".xlsx", ".csv"].includes(extension)) {
            return res.status(400).json({
                message: "Only .xlsx and .csv files are supported"
            });
        }

        const workbook = XLSX.read(req.file.buffer, {
            type: "buffer",
            bookVBA: false
        });

        if (!workbook.SheetNames.length) {
            return res.status(400).json({
                message: "The uploaded file contains no worksheet"
            });
        }

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Keep blank rows so validation errors use actual spreadsheet row numbers.
        const rows = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: "",
            blankrows: true,
            raw: false
        });

        if (rows.length < 2) {
            return res.status(400).json({
                message: "The file must contain a header row and at least one question"
            });
        }

        // 2. Normalize column headings
        const normalizeHeader = (value) =>
            String(value ?? "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_");

        const headers = rows[0].map(normalizeHeader);

        const requiredHeaders = [
            "question",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "correct_option",
            "difficulty"
        ];

        const missingHeaders = requiredHeaders.filter(
            header => !headers.includes(header)
        );

        if (missingHeaders.length) {
            return res.status(400).json({
                message: "The spreadsheet is missing required columns",
                errors: missingHeaders.map(header => ({
                    row: 1,
                    message: `Missing column: ${header}`
                }))
            });
        }

        const errors = [];
        const questions = [];

        // 3. Validate every non-empty row before inserting anything
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i];
            const rowNumber = i + 1;

            if (cells.every(value => String(value ?? "").trim() === "")) {
                continue;
            }

            const item = {};

            headers.forEach((header, index) => {
                item[header] = String(cells[index] ?? "").trim();
            });

            const question = item.question;
            const optionA = item.option_a;
            const optionB = item.option_b;
            const optionC = item.option_c;
            const optionD = item.option_d;
            const correctOption = item.correct_option.toUpperCase();
            const difficulty = item.difficulty.toLowerCase();

            const rowErrors = [];

            if (!question) rowErrors.push("Question is required");
            if (!optionA) rowErrors.push("Option A is required");
            if (!optionB) rowErrors.push("Option B is required");
            if (!optionC) rowErrors.push("Option C is required");
            if (!optionD) rowErrors.push("Option D is required");

            if (!["A", "B", "C", "D"].includes(correctOption)) {
                rowErrors.push("Correct option must be A, B, C or D");
            }

            if (!["easy", "medium", "hard"].includes(difficulty)) {
                rowErrors.push("Difficulty must be easy, medium or hard");
            }

            if (rowErrors.length) {
                errors.push({
                    row: rowNumber,
                    message: rowErrors.join("; ")
                });
                continue;
            }

            questions.push({
                question,
                code: item.code || null,
                optionA,
                optionB,
                optionC,
                optionD,
                correctOption,
                difficulty
            });
        }

        if (questions.length === 0 && errors.length === 0) {
            errors.push({
                row: 2,
                message: "No question data found"
            });
        }

        if (errors.length) {
            return res.status(400).json({
                message: "Please correct the spreadsheet errors and upload again",
                errors
            });
        }

        if (questions.length > 500) {
            return res.status(400).json({
                message: "A maximum of 500 questions can be imported at once"
            });
        }

        // 4. Verify that the selected subject and topic are active
        const [topicRows] = await db.query(
            `SELECT st.id
             FROM subject_topics st
             JOIN subjects s ON s.id = st.subject_id
             WHERE st.id = ?
               AND st.subject_id = ?
               AND st.status = 'active'
               AND s.status = 'active'`,
            [Number(topicId), Number(subjectId)]
        );

        if (!topicRows.length) {
            return res.status(400).json({
                message: "The selected topic does not belong to an active subject"
            });
        }

        // 5. Insert all questions in one transaction
        connection = await db.getConnection();
        await connection.beginTransaction();

        for (const question of questions) {
            await connection.query(
                `INSERT INTO diagnostic_questions
                 (
                    subject_id,
                    topic_id,
                    question,
                    code,
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                    correct_option,
                    difficulty
                 )
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    Number(subjectId),
                    Number(topicId),
                    question.question,
                    question.code,
                    question.optionA,
                    question.optionB,
                    question.optionC,
                    question.optionD,
                    question.correctOption,
                    question.difficulty
                ]
            );
        }

        await connection.commit();

        return res.status(201).json({
            message: "Diagnostic questions imported successfully",
            importedCount: questions.length
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Diagnostic question import failed:", error);

        return res.status(400).json({
            message: "Failed to import questions. Check the file format and data."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    createDiagnosticQuestion,
    updateDiagnosticQuestion,
    getDiagnosticQuestions,
    getDiagnosticSubjects,
    getDiagnosticTopics,
    importDiagnosticQuestions
};
