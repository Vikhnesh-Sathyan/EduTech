
const db = require("../../../../config/db");

// ==========================================
// GET QUESTION FORM DATA
// ==========================================

const getQuestionFormData = async (req, res) => {

    try {

        const [categories] = await db.execute(
            `SELECT id, category_name
             FROM career_question_categories
             WHERE is_active = 1
             ORDER BY category_name ASC`
        );

        return res.status(200).json({
            success: true,
            categories
        });

    } catch (error) {

        console.error("Get question form data error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load question form data"
        });
    }
};


// ==========================================
// SUBMIT CAREER QUESTION
// ==========================================


const submitCareerQuestion = async (req, res) => {

    try {

        const studentId = req.user.id;

        const {
            category_id,
            question_text,
            answer_text,
            explanation
        } = req.body;

        // ==========================================
        // REQUIRED FIELD VALIDATION
        // ==========================================

        if (
            category_id === undefined ||
            category_id === null ||
            !Number.isInteger(Number(category_id)) ||
            Number(category_id) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid category"
            });
        }

        if (
            typeof question_text !== "string" ||
            !question_text.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Question is required"
            });
        }

        // ==========================================
        // TEXT LENGTH VALIDATION
        // ==========================================

        const trimmedQuestion = question_text.trim();
        const trimmedAnswer =
            typeof answer_text === "string" ? answer_text.trim() : "";

        const trimmedExplanation =
            typeof explanation === "string" ? explanation.trim() : "";

        if (trimmedQuestion.length > 5000) {
            return res.status(400).json({
                success: false,
                message: "Question cannot exceed 5000 characters"
            });
        }

        if (trimmedAnswer.length > 10000) {
            return res.status(400).json({
                success: false,
                message: "Answer cannot exceed 10000 characters"
            });
        }

        if (trimmedExplanation.length > 10000) {
            return res.status(400).json({
                success: false,
                message: "Explanation cannot exceed 10000 characters"
            });
        }

        // ==========================================
        // VALIDATE ACTIVE CATEGORY
        // ==========================================

        const [categories] = await db.execute(
            `SELECT id
             FROM career_question_categories
             WHERE id = ?
             AND is_active = 1`,
            [Number(category_id)]
        );

        if (categories.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or inactive category"
            });
        }

        // ==========================================
        // INSERT CAREER QUESTION
        // ==========================================

        await db.execute(
            `INSERT INTO career_questions
             (
                category_id,
                question_text,
                answer_text,
                explanation,
                created_by,
                status
             )
             VALUES (?, ?, ?, ?, ?, 'published')`,
            [
                Number(category_id),
                trimmedQuestion,
                trimmedAnswer || null,
                trimmedExplanation || null,
                studentId
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Career question shared successfully"
        });

    } catch (error) {

        console.error("Submit career question error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to share career question"
        });
    }
};

// ==========================================
// GET CAREER QUESTIONS
// ==========================================

const getCareerQuestions = async (req, res) => {

    try {

        const studentId = req.user.id;

        const [questions] = await db.execute(
            `SELECT
                q.id,
                q.category_id,
                c.category_name,
                q.question_text,
                q.answer_text,
                q.explanation,
                q.created_by,
                q.status,
                q.created_at,
                u.name AS contributor_name

             FROM career_questions q

             JOIN career_question_categories c
                ON q.category_id = c.id

             JOIN users u
                ON q.created_by = u.id

             WHERE q.status = 'published'
                OR q.created_by = ?

             ORDER BY q.created_at DESC`,
            [studentId]
        );

        return res.status(200).json({
            success: true,
            questions
        });

    } catch (error) {

        console.error("Get career questions error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch career questions"
        });
    }
};


module.exports = {
    getQuestionFormData,
    submitCareerQuestion,
    getCareerQuestions
};
