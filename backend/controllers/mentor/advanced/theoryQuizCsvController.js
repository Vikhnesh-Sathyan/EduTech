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
        // 1. Check uploaded CSV file
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload the CSV file again to import"
            });
        }

        // 2. Read quiz details
        const {
            title,
            description,
            education_program_id,
            department_id,
            education_year_id,
            subject_id,
            topic_id,
            subtopic_id,
            difficulty,
            pass_percentage
        } = req.body;

        // 3. Validate quiz title
        if (
            typeof title !== "string" ||
            !title.trim() ||
            title.trim().length > 200
        ) {
            return res.status(400).json({
                message: "A quiz title is required (maximum 200 characters)"
            });
        }

        // 4. Validate education hierarchy IDs
        
const educationProgramId = Number(education_program_id);
const departmentId = Number(department_id);
const educationYearId = Number(education_year_id);
const subjectId = Number(subject_id);

const educationIds = {
    education_program_id: educationProgramId,
    department_id: departmentId,
    education_year_id: educationYearId,
    subject_id: subjectId
};

console.log("Received education IDs:", req.body);
console.log("Converted education IDs:", educationIds);

const invalidEducationId = Object.values(educationIds).some(
    id => !Number.isSafeInteger(id) || id <= 0
);

if (invalidEducationId) {
    return res.status(400).json({
        message: "Please select a valid program, department, education year, and subject.",
        received: {
            education_program_id,
            department_id,
            education_year_id,
            subject_id
        }
    });
}


        if (
            !Number.isInteger(educationProgramId) ||
            educationProgramId <= 0 ||
            !Number.isInteger(departmentId) ||
            departmentId <= 0 ||
            !Number.isInteger(educationYearId) ||
            educationYearId <= 0 ||
            !Number.isInteger(subjectId) ||
            subjectId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Please select a valid program, department, education year, and subject."
            });
        }

        // 5. Validate difficulty
        const selectedDifficulty = difficulty || "beginner";

        if (
            !["beginner", "intermediate", "advanced"].includes(
                selectedDifficulty
            )
        ) {
            return res.status(400).json({
                message: "Invalid difficulty"
            });
        }

        // 6. Validate pass percentage
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

        // 7. Validate topic and subtopic IDs
        const topicId =
            topic_id === undefined ||
            topic_id === null ||
            topic_id === ""
                ? null
                : Number(topic_id);

        const subtopicId =
            subtopic_id === undefined ||
            subtopic_id === null ||
            subtopic_id === ""
                ? null
                : Number(subtopic_id);

        if (
            (topicId !== null &&
                (!Number.isInteger(topicId) || topicId <= 0)) ||
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

        // 8. Validate CSV on the server
        const csvText = req.file.buffer.toString("utf8");
        const validation = validateTheoryQuizCsv(csvText);

        if (!validation.valid) {
            return res.status(400).json({
                message: "CSV validation failed. Nothing was imported.",
                errors: validation.errors
            });
        }

        // 9. Start database transaction
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 10. Validate the education hierarchy:
        // Program -> Department -> Education Year -> Subject
        const [hierarchyRows] = await connection.query(
            `SELECT
                d.id AS department_id,
                ey.id AS education_year_id,
                s.id AS subject_id
             FROM departments d
             INNER JOIN education_years ey
                ON ey.department_id = d.id
             INNER JOIN subjects s
                ON s.education_year_id = ey.id
             WHERE d.id = ?
               AND d.education_program_id = ?
               AND ey.id = ?
               AND s.id = ?
               AND d.status = 'active'
               AND ey.status = 'active'
               AND s.status = 'active'`,
            [
                departmentId,
                educationProgramId,
                educationYearId,
                subjectId
            ]
        );

        if (hierarchyRows.length === 0) {
            throw new Error(
                "The selected program, department, year, and subject do not match."
            );
        }

        // 11. Validate topic belongs to the selected subject
        if (topicId !== null) {
            const [topics] = await connection.query(
                `SELECT id
                 FROM subject_topics
                 WHERE id = ? AND subject_id = ?`,
                [topicId, subjectId]
            );

            if (!topics.length) {
                throw new Error(
                    "Topic does not belong to the selected subject"
                );
            }
        }

        // 12. Validate subtopic belongs to the selected topic
        if (subtopicId !== null) {
            const [subtopics] = await connection.query(
                `SELECT id
                 FROM learning_subtopics
                 WHERE id = ? AND topic_id = ?`,
                [subtopicId, topicId]
            );

            if (!subtopics.length) {
                throw new Error(
                    "Subtopic does not belong to the selected topic"
                );
            }
        }

        // 13. Insert quiz as a draft
        const [quizResult] = await connection.query(
            `INSERT INTO advanced_theory_quizzes
                (
                    mentor_id,
                    title,
                    description,
                    education_program_id,
                    department_id,
                    education_year_id,
                    subject_id,
                    topic_id,
                    subtopic_id,
                    difficulty,
                    pass_percentage,
                    status
                )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [
                req.user.id,
                title.trim(),
                description?.trim() || null,
                educationProgramId,
                departmentId,
                educationYearId,
                subjectId,
                topicId,
                subtopicId,
                selectedDifficulty,
                passPercentage
            ]
        );

        const quizId = quizResult.insertId;

        // 14. Insert questions and their options
        for (const question of validation.rows) {
            const [questionResult] = await connection.query(
                `INSERT INTO advanced_theory_questions
                    (
                        quiz_id,
                        question_text,
                        explanation,
                        concept_tag,
                        marks,
                        display_order,
                        status
                    )
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
                        (
                            question_id,
                            option_text,
                            is_correct,
                            display_order
                        )
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

        // 15. Commit only after everything succeeds
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
            "The selected program, department, year, and subject do not match.",
            "Topic does not belong to the selected subject",
            "Subtopic does not belong to the selected topic"
        ];

        return res
            .status(clientErrors.includes(error.message) ? 400 : 500)
            .json({
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