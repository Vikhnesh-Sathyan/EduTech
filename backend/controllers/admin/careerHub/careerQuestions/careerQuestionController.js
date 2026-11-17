
const db = require("../../../../config/db");

// ==========================================
// GET ACTIVE QUESTION CATEGORIES
// ==========================================

const getQuestionFormData = async (req, res) => {

    try {

        const sql = `
            SELECT
                id,
                category_name

            FROM career_question_categories

            WHERE is_active = 1

            ORDER BY category_name
        `;

        const [categories] = await db.execute(sql);

        return res.status(200).json({
            success: true,
            message: "Question categories fetched successfully",
            data: categories
        });

    } catch (error) {

        console.error("Get question form data error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load question categories"
        });

    }

};


// ==========================================
// CREATE CAREER QUESTION
// ==========================================

const createCareerQuestion = async (req, res) => {

    try {

        const {
            category_id,
            question_text,
            answer_text,
            explanation
        } = req.body;

        const adminId = req.user.id;

        // Validate required fields

        if (!category_id || !question_text) {

            return res.status(400).json({
                success: false,
                message: "Category and question are required"
            });

        }

        // Validate category ID

        if (
            !Number.isInteger(Number(category_id)) ||
            Number(category_id) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });

        }

        // Validate question

        if (
            typeof question_text !== "string" ||
            !question_text.trim() ||
            question_text.trim().length > 5000
        ) {

            return res.status(400).json({
                success: false,
                message: "Question is required and must be within 5000 characters"
            });

        }

        // Validate optional answer and explanation

        if (
            (answer_text != null && typeof answer_text !== "string") ||
            (explanation != null && typeof explanation !== "string")
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid answer or explanation"
            });

        }

        // Verify active category

        const [categories] = await db.execute(
            `
                SELECT id
                FROM career_question_categories
                WHERE id = ?
                  AND is_active = 1
            `,
            [category_id]
        );

        if (categories.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Selected category is unavailable"
            });

        }

        // Insert question

        const insertSql = `
            INSERT INTO career_questions
            (
                category_id,
                question_text,
                answer_text,
                explanation,
                created_by,
                status
            )

            VALUES (?, ?, ?, ?, ?, 'published')
        `;

        const [result] = await db.execute(
            insertSql,
            [
                category_id,
                question_text.trim(),
                answer_text?.trim() || null,
                explanation?.trim() || null,
                adminId
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Career question created successfully",
            data: {
                question_id: result.insertId,
                status: "published"
            }
        });

    } catch (error) {

        console.error("Create career question error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create career question"
        });

    }

};


// ==========================================
// GET ALL CAREER QUESTIONS
// ==========================================

const getCareerQuestions = async (req, res) => {

    try {

        const sql = `
            SELECT
                q.id,

                q.category_id,
                c.category_name,

                q.question_text,
                q.answer_text,
                q.explanation,

                q.created_by,
                u.name AS contributor_name,
                u.role AS contributor_role,

                q.status,
                q.created_at,
                q.updated_at

            FROM career_questions q

            INNER JOIN career_question_categories c
                ON c.id = q.category_id

            INNER JOIN users u
                ON u.id = q.created_by

            ORDER BY q.created_at DESC
        `;

        const [questions] = await db.execute(sql);

        return res.status(200).json({
            success: true,
            message: "Career questions fetched successfully",
            data: questions
        });

    } catch (error) {

        console.error("Get career questions error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch career questions"
        });

    }

};


// ==========================================
// UPDATE CAREER QUESTION
// ==========================================

const updateCareerQuestion = async (req, res) => {

    try {

        const { questionId } = req.params;

        const {
            category_id,
            question_text,
            answer_text,
            explanation
        } = req.body;

        // Validate question ID

        if (
            !Number.isInteger(Number(questionId)) ||
            Number(questionId) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid question ID"
            });

        }

        // Validate required fields

        if (
            !category_id ||
            typeof question_text !== "string" ||
            !question_text.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "Category and question are required"
            });

        }

        if (
            !Number.isInteger(Number(category_id)) ||
            Number(category_id) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });

        }

        if (question_text.trim().length > 5000) {

            return res.status(400).json({
                success: false,
                message: "Question cannot exceed 5000 characters"
            });

        }

        if (
            (answer_text != null && typeof answer_text !== "string") ||
            (explanation != null && typeof explanation !== "string")
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid answer or explanation"
            });

        }

        // Verify active category

        const [categories] = await db.execute(
            `
                SELECT id
                FROM career_question_categories
                WHERE id = ?
                  AND is_active = 1
            `,
            [category_id]
        );

        if (categories.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Selected category is unavailable"
            });

        }

        // Update question

        const updateSql = `
            UPDATE career_questions

            SET
                category_id = ?,
                question_text = ?,
                answer_text = ?,
                explanation = ?

            WHERE id = ?
        `;

        const [result] = await db.execute(
            updateSql,
            [
                category_id,
                question_text.trim(),
                answer_text?.trim() || null,
                explanation?.trim() || null,
                questionId
            ]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Career question not found"
            });

        }

        return res.status(200).json({
            success: true,
            message: "Career question updated successfully"
        });

    } catch (error) {

        console.error("Update career question error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update career question"
        });

    }

};


// ==========================================
// ARCHIVE CAREER QUESTION
// ==========================================

const archiveCareerQuestion = async (req, res) => {

    try {

        const { questionId } = req.params;

        if (
            !Number.isInteger(Number(questionId)) ||
            Number(questionId) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid question ID"
            });

        }

        const sql = `
            UPDATE career_questions

            SET status = 'archived'

            WHERE id = ?
              AND status = 'published'
        `;

        const [result] = await db.execute(
            sql,
            [questionId]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Published career question not found"
            });

        }

        return res.status(200).json({
            success: true,
            message: "Career question archived successfully"
        });

    } catch (error) {

        console.error("Archive career question error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to archive career question"
        });

    }

};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    getQuestionFormData,
    createCareerQuestion,
    getCareerQuestions,
    updateCareerQuestion,
    archiveCareerQuestion
};
