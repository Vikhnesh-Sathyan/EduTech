const db = require("../../../config/db");

const {
    validateTheoryQuizCsv
} = require("../../../utils/theoryQuizCsvValidator");

// ==========================================
// CREATE DRAFT QUIZ
// ==========================================
const createQuiz = async (req, res) => {
    try {
        const {
            title,
            description,
            topic_id,
            subtopic_id,
            difficulty,
            pass_percentage
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Quiz title is required"
            });
        }

        if (title.trim().length > 200) {
            return res.status(400).json({
                message: "Quiz title cannot exceed 200 characters"
            });
        }

        const allowedDifficulties = [
            "beginner",
            "intermediate",
            "advanced"
        ];

        const selectedDifficulty = difficulty || "beginner";

        if (!allowedDifficulties.includes(selectedDifficulty)) {
            return res.status(400).json({
                message: "Invalid difficulty"
            });
        }

        const passPercentage =
            pass_percentage === undefined ? 60 : Number(pass_percentage);

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
            subtopic_id === undefined ||
            subtopic_id === null ||
            subtopic_id === ""
                ? null
                : Number(subtopic_id);

        if (
            topicId !== null &&
            (!Number.isInteger(topicId) || topicId <= 0)
        ) {
            return res.status(400).json({
                message: "Invalid topic ID"
            });
        }

        if (
            subtopicId !== null &&
            (!Number.isInteger(subtopicId) || subtopicId <= 0)
        ) {
            return res.status(400).json({
                message: "Invalid subtopic ID"
            });
        }

        // Validate that the selected topic exists.
        if (topicId !== null) {
            const [topics] = await db.query(
                `SELECT id
                 FROM subject_topics
                 WHERE id = ?`,
                [topicId]
            );

            if (topics.length === 0) {
                return res.status(404).json({
                    message: "Topic not found"
                });
            }
        }

        // Ensure the subtopic belongs to the selected topic.
        if (subtopicId !== null) {
            if (topicId === null) {
                return res.status(400).json({
                    message: "Select a topic before selecting a subtopic"
                });
            }

            const [subtopics] = await db.query(
                `SELECT id
                 FROM learning_subtopics
                 WHERE id = ? AND topic_id = ?`,
                [subtopicId, topicId]
            );

            if (subtopics.length === 0) {
                return res.status(400).json({
                    message: "The subtopic does not belong to the selected topic"
                });
            }
        }

        const [result] = await db.query(
            `INSERT INTO advanced_theory_quizzes
                (
                    mentor_id,
                    title,
                    description,
                    topic_id,
                    subtopic_id,
                    difficulty,
                    pass_percentage,
                    status
                )
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

        return res.status(201).json({
            message: "Draft quiz created successfully",
            quizId: result.insertId
        });
    } catch (error) {
        console.error("Create mentor theory quiz error:", error);

        return res.status(500).json({
            message: "Failed to create quiz"
        });
    }
};

// ==========================================
// GET MY QUIZZES
// ==========================================
const getMyQuizzes = async (req, res) => {
    try {
        const [quizzes] = await db.query(
            `SELECT
                id,
                title,
                description,
                topic_id,
                subtopic_id,
                difficulty,
                pass_percentage,
                status,
                created_at,
                updated_at
             FROM advanced_theory_quizzes
             WHERE mentor_id = ?
             ORDER BY updated_at DESC, id DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            message: "Your quizzes retrieved successfully",
            quizzes
        });
    } catch (error) {
        console.error("Get mentor theory quizzes error:", error);

        return res.status(500).json({
            message: "Failed to retrieve your quizzes"
        });
    }
};

// ==========================================
// GET ONE OWN QUIZ
// ==========================================

const getMyQuizById = async (req, res) => {
    try {
        const quizId = Number(req.params.quizId);

        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                message: "Invalid quiz ID"
            });
        }

        // 1. Get quiz details and verify mentor ownership.
        const [quizzes] = await db.query(
            `SELECT
                id,
                mentor_id,
                title,
                description,
                topic_id,
                subtopic_id,
                difficulty,
                pass_percentage,
                status,
                created_at,
                updated_at
             FROM advanced_theory_quizzes
             WHERE id = ? AND mentor_id = ?`,
            [quizId, req.user.id]
        );

        if (quizzes.length === 0) {
            return res.status(404).json({
                message: "Quiz not found or you do not own it"
            });
        }

        // 2. Get all questions belonging to this quiz.
        const [questions] = await db.query(
            `SELECT
                id,
                question_text,
                explanation,
                concept_tag,
                marks,
                display_order,
                status
             FROM advanced_theory_questions
             WHERE quiz_id = ?
             ORDER BY display_order ASC, id ASC`,
            [quizId]
        );

        // 3. Get all options for those questions.
        let options = [];

        if (questions.length > 0) {
            const questionIds = questions.map(question => question.id);
            const placeholders = questionIds.map(() => "?").join(", ");

            const [optionRows] = await db.query(
                `SELECT
                    id,
                    question_id,
                    option_text,
                    is_correct,
                    display_order
                 FROM advanced_theory_options
                 WHERE question_id IN (${placeholders})
                 ORDER BY display_order ASC, id ASC`,
                questionIds
            );

            options = optionRows;
        }

        // 4. Attach options to their matching questions.
        const formattedQuestions = questions.map(question => ({
            ...question,
            options: options.filter(
                option => option.question_id === question.id
            )
        }));

        return res.status(200).json({
            message: "Quiz retrieved successfully",
            quiz: {
                ...quizzes[0],
                questions: formattedQuestions
            }
        });

    } catch (error) {
        console.error("Get mentor theory quiz error:", error);

        return res.status(500).json({
            message: "Failed to retrieve quiz"
        });
    }
};






module.exports = {
    createQuiz,
    getMyQuizzes,
    getMyQuizById,
    
};
