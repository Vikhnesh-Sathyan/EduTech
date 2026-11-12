
const db = require("../../../config/db");

const {
    validateCsvBuffer
} = require("../../../services/dailyQuiz/csvService");

// ==========================================
// PREVIEW DAILY QUIZ CSV
// ==========================================

const previewDailyQuizCsv = async (req, res) => {
    try {

        // GET SELECTED SUBJECT ID FROM FRONTEND

        const selectedSubjectId = Number(req.body.subject_id);

        if (
            !Number.isInteger(selectedSubjectId) ||
            selectedSubjectId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid subject"
            });
        }

        // CHECK UPLOADED FILE

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

        // VERIFY SELECTED SUBJECT IN DATABASE

        const [subjects] = await db.execute(
            `SELECT id, name
             FROM subjects
             WHERE id = ?
               AND status = 'active'`,
            [selectedSubjectId]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Selected subject not found or inactive"
            });
        }

        // VALIDATE CSV CONTENT

        const result = await validateCsvBuffer(req.file.buffer);

        if (!result.success) {
            return res.status(400).json(result);
        }

        // RETURN PREVIEW

        return res.status(200).json({
            success: true,
            message: "CSV preview generated successfully",

            subject: subjects[0],

            total_rows: result.total_rows,
            valid_count: result.valid_count,
            invalid_count: result.invalid_count,

            valid_rows: result.valid_rows,
            invalid_rows: result.invalid_rows
        });

    } catch (error) {

        console.error(
            "Daily Quiz CSV preview error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to preview CSV file"
        });

    }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    previewDailyQuizCsv
};
