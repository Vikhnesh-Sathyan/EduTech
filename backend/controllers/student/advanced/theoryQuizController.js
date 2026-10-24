
const pool = require("../../../config/db");

// GET /api/student/advanced/theory-quizzes
const getPublishedQuizzes = async (req, res) => {
    try {
        const [quizzes] = await pool.query(
            `SELECT
                id,
                title,
                description,
                topic_id,
                subtopic_id,
                difficulty,
                pass_percentage
             FROM advanced_theory_quizzes
             WHERE status = 'published'
             ORDER BY created_at DESC`
        );

        return res.status(200).json({
            success: true,
            quizzes
        });
    } catch (error) {
        console.error("Get theory quizzes error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load theory quizzes"
        });
    }
};

// GET /api/student/advanced/theory-quizzes/:quizId
const getTheoryQuizById = async (req, res) => {
    try {
        const quizId = Number(req.params.quizId);

        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID"
            });
        }

        const [quizzes] = await pool.query(
            `SELECT
                id,
                title,
                description,
                difficulty,
                pass_percentage
             FROM advanced_theory_quizzes
             WHERE id = ? AND status = 'published'`,
            [quizId]
        );

        if (quizzes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Theory quiz not found"
            });
        }

        const [questions] = await pool.query(
            `SELECT
                id,
                question_text,
                concept_tag,
                marks,
                display_order
             FROM advanced_theory_questions
             WHERE quiz_id = ? AND status = 'active'
             ORDER BY display_order ASC, id ASC`,
            [quizId]
        );

        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "This quiz has no active questions yet"
            });
        }

        const questionIds = questions.map(question => question.id);
        const placeholders = questionIds.map(() => "?").join(",");

        const [options] = await pool.query(
            `SELECT
                id,
                question_id,
                option_text,
                display_order
             FROM advanced_theory_options
             WHERE question_id IN (${placeholders})
             ORDER BY display_order ASC, id ASC`,
            questionIds
        );

        const optionsByQuestion = {};

        for (const option of options) {
            if (!optionsByQuestion[option.question_id]) {
                optionsByQuestion[option.question_id] = [];
            }

            optionsByQuestion[option.question_id].push({
                id: option.id,
                option_text: option.option_text
            });
        }

        const quizQuestions = questions.map(question => ({
            ...question,
            options: optionsByQuestion[question.id] || []
        }));

        return res.status(200).json({
            success: true,
            quiz: quizzes[0],
            questions: quizQuestions
        });
    } catch (error) {
        console.error("Get theory quiz details error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load theory quiz"
        });
    }
};

module.exports = {
    getPublishedQuizzes,
    getTheoryQuizById
};
