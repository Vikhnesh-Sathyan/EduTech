const db = require("../../../config/db");

const {
    validateTheoryQuizCsv
} = require("../../../utils/theoryQuizCsvValidator");

const previewTheoryQuizCsv = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a CSV file"
            });
        }

        // Read the uploaded CSV without saving anything to MySQL.
        const csvText = req.file.buffer.toString("utf8");

        const result = validateTheoryQuizCsv(csvText);

        if (!result.valid) {
            return res.status(400).json({
                message: "CSV validation failed. No data was saved.",
                valid: false,
                errors: result.errors
            });
        }

        return res.status(200).json({
            message: "CSV validated successfully. Ready for preview.",
            valid: true,
            totalQuestions: result.rows.length,
            questions: result.rows
        });
    } catch (error) {
        console.error("Preview theory quiz CSV error:", error);

        return res.status(500).json({
            message: "Failed to preview CSV"
        });
    }
};


const importTheoryQuizCsv = async (req, res) => {
    let connection;

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload the CSV file again to import"
            });
        }

        const {
            title,
            description,
            topic_id,
            subtopic_id,
            difficulty,
            pass_percentage
        } = req.body;

        if (!title || !title.trim() || title.trim().length > 200) {
            return res.status(400).json({
                message: "A quiz title is required (maximum 200 characters)"
            });
        }

        const selectedDifficulty = difficulty || "beginner";

        if (!["beginner", "intermediate", "advanced"].includes(selectedDifficulty)) {
            return res.status(400).json({
                message: "Invalid difficulty"
            });
        }

        const passPercentage =
            pass_percentage === undefined || pass_percentage === ""
                ? 60
                : Number(pass_percentage);

        if (
            !Number.isFinite(passPercentage) ||
            passPercentage < 0 ||
            passPercentage > 100
        ) {
            return res.status(400).json({
                message: "Pass percentage must be between 0 and 100"
            });
        }

        const topicId =
            topic_id === undefined || topic_id === null || topic_id === ""
                ? null
                : Number(topic_id);

        const subtopicId =
            subtopic_id === undefined || subtopic_id === null || subtopic_id === ""
                ? null
                : Number(subtopic_id);

        if (
            (topicId !== null && (!Number.isInteger(topicId) || topicId <= 0)) ||
            (subtopicId !== null &&
                (!Number.isInteger(subtopicId) || subtopicId <= 0))
        ) {
            return res.status(400).json({
                message: "Invalid topic or subtopic ID"
            });
        }

        if (subtopicId !== null && topicId === null) {
            return res.status(400).json({
                message: "Select a topic before selecting a subtopic"
            });
        }

        // Validate the entire CSV again on the server.
        const csvText = req.file.buffer.toString("utf8");
        const validation = validateTheoryQuizCsv(csvText);

        if (!validation.valid) {
            return res.status(400).json({
                message: "CSV validation failed. Nothing was imported.",
                errors: validation.errors
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Validate topic and subtopic inside the import workflow.
        if (topicId !== null) {
            const [topics] = await connection.query(
                "SELECT id FROM subject_topics WHERE id = ?",
                [topicId]
            );

            if (!topics.length) {
                throw new Error("Topic not found");
            }
        }

        if (subtopicId !== null) {
            const [subtopics] = await connection.query(
                `SELECT id FROM learning_subtopics
                 WHERE id = ? AND topic_id = ?`,
                [subtopicId, topicId]
            );

            if (!subtopics.length) {
                throw new Error("Subtopic does not belong to the selected topic");
            }
        }

        const [quizResult] = await connection.query(
            `INSERT INTO advanced_theory_quizzes
                (mentor_id, title, description, topic_id, subtopic_id,
                 difficulty, pass_percentage, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [
                req.user.id,
                title.trim(),
                description?.trim() || null,
                topicId,
                subtopicId,
                selectedDifficulty,
                passPercentage
            ]
        );

        const quizId = quizResult.insertId;

        for (const question of validation.rows) {
            const [questionResult] = await connection.query(
                `INSERT INTO advanced_theory_questions
                    (quiz_id, question_text, explanation, concept_tag,
                     marks, display_order, status)
                 VALUES (?, ?, ?, ?, ?, ?, 'active')`,
                [
                    quizId,
                    question.question_text,
                    question.explanation,
                    question.concept_tag,
                    question.marks,
                    question.display_order
                ]
            );

            const questionId = questionResult.insertId;

            for (const option of question.options) {
                await connection.query(
                    `INSERT INTO advanced_theory_options
                        (question_id, option_text, is_correct, display_order)
                     VALUES (?, ?, ?, ?)`,
                    [
                        questionId,
                        option.option_text,
                        option.is_correct,
                        option.display_order
                    ]
                );
            }
        }

        await connection.commit();

        return res.status(201).json({
            message: "Quiz imported successfully as a draft",
            quizId,
            totalQuestions: validation.rows.length
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Import theory quiz CSV error:", error);

        const clientErrors = [
            "Topic not found",
            "Subtopic does not belong to the selected topic"
        ];

        return res.status(clientErrors.includes(error.message) ? 400 : 500).json({
            message: clientErrors.includes(error.message)
                ? error.message
                : "Import failed. No quiz data was saved."
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};



module.exports = {
    previewTheoryQuizCsv,
    importTheoryQuizCsv
};