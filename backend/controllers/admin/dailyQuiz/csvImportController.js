
const db = require("../../../config/db");

const {
    validateCsvBuffer
} = require("../../../services/dailyQuiz/csvService");

// ==========================================
// NORMALIZE QUESTION TEXT
// ==========================================

const normalizeQuestion = (text) => {
    return text
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
};

// ==========================================
// IMPORT DAILY QUIZ CSV
// ==========================================

const importDailyQuizCsv = async (req, res) => {
    let connection;

    try {
        const subjectId = Number(req.body.subject_id);
        const adminId = req.user.id;

        // CHECK SELECTED SUBJECT

        if (!Number.isInteger(subjectId) || subjectId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid subject"
            });
        }

        // CHECK FILE

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: "Please upload a CSV file"
            });
        }

        if (
            !req.file.originalname
                .toLowerCase()
                .endsWith(".csv")
        ) {
            return res.status(400).json({
                success: false,
                message: "Only CSV files are allowed"
            });
        }

        // VALIDATE CSV

        const result = await validateCsvBuffer(req.file.buffer);

        if (!result.success) {
            return res.status(400).json(result);
        }

        // REJECT INVALID ROWS

        if (result.invalid_count > 0) {
            return res.status(400).json({
                success: false,
                message: "CSV contains invalid rows. Correct them before importing.",
                total_rows: result.total_rows,
                valid_count: result.valid_count,
                invalid_count: result.invalid_count,
                invalid_rows: result.invalid_rows
            });
        }

        // CHECK VALID QUESTIONS

        if (result.valid_rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid questions available for import"
            });
        }

        // START TRANSACTION

        connection = await db.getConnection();

        await connection.beginTransaction();

        // VERIFY SELECTED SUBJECT IS ACTIVE

        const [subjects] = await connection.execute(
            `SELECT id
             FROM subjects
             WHERE id = ?
               AND status = 'active'`,
            [subjectId]
        );

        if (subjects.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Selected subject not found or inactive"
            });
        }

        // CHECK EXISTING QUESTIONS IN SELECTED SUBJECT

        const [existingQuestions] = await connection.execute(
            `SELECT question_text
             FROM question_bank_questions
             WHERE subject_id = ?`,
            [subjectId]
        );

        const existingQuestionSet = new Set(
            existingQuestions.map(question =>
                normalizeQuestion(question.question_text)
            )
        );

        const duplicateRows = result.valid_rows.filter(row =>
            existingQuestionSet.has(
                normalizeQuestion(row.data.question_text)
            )
        );

        if (duplicateRows.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "Some questions already exist in this subject's question bank",
                duplicate_count: duplicateRows.length,
                duplicate_rows: duplicateRows.map(row => row.row_number)
            });
        }

        // INSERT QUESTIONS AND OPTIONS

        let importedCount = 0;

        for (const row of result.valid_rows) {

            const [questionResult] = await connection.execute(
                `INSERT INTO question_bank_questions (
                    subject_id,
                    created_by,
                    question_text
                ) VALUES (?, ?, ?)`,
                [
                    subjectId,
                    adminId,
                    row.data.question_text
                ]
            );

            const questionId = questionResult.insertId;

            for (
                let index = 0;
                index < row.data.options.length;
                index++
            ) {

                const option = row.data.options[index];

                await connection.execute(
                    `INSERT INTO question_bank_options (
                        question_id,
                        option_text,
                        is_correct,
                        option_order
                    ) VALUES (?, ?, ?, ?)`,
                    [
                        questionId,
                        option.option_text,
                        option.is_correct ? 1 : 0,
                        index + 1
                    ]
                );

            }

            importedCount++;
        }

        // COMMIT TRANSACTION

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Questions imported successfully",
            imported_count: importedCount,
            subject_id: subjectId
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Daily Quiz CSV import error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to import CSV questions"
        });

    } finally {

        if (connection) {
            connection.release();
        }

    }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    importDailyQuizCsv
};
