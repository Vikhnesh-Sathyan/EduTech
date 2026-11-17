
const db = require("../../../../config/db");

// ==========================================
// CREATE QUESTION CATEGORY
// ==========================================

const createQuestionCategory = async (req, res) => {

    try {

        const { category_name, description } = req.body;

        // Validate category name

        if (
            typeof category_name !== "string" ||
            !category_name.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });

        }

        if (category_name.trim().length > 100) {

            return res.status(400).json({
                success: false,
                message: "Category name cannot exceed 100 characters"
            });

        }

        // Validate optional description

        if (
            description != null &&
            typeof description !== "string"
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid category description"
            });

        }

        // Check duplicate category

        const checkSql = `
            SELECT id
            FROM career_question_categories
            WHERE LOWER(category_name) = LOWER(?)
            LIMIT 1
        `;

        const [existingCategory] = await db.execute(
            checkSql,
            [category_name.trim()]
        );

        if (existingCategory.length > 0) {

            return res.status(409).json({
                success: false,
                message: "This category already exists"
            });

        }

        // Insert category

        const insertSql = `
            INSERT INTO career_question_categories
            (
                category_name,
                description
            )

            VALUES (?, ?)
        `;

        const [result] = await db.execute(
            insertSql,
            [
                category_name.trim(),
                description?.trim() || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Question category created successfully",
            data: {
                category_id: result.insertId
            }
        });

    } catch (error) {

        console.error("Create question category error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create question category"
        });

    }

};


// ==========================================
// GET QUESTION CATEGORIES
// ==========================================

const getQuestionCategories = async (req, res) => {

    try {

        const sql = `
            SELECT
                id,
                category_name,
                description,
                is_active,
                created_at,
                updated_at

            FROM career_question_categories

            ORDER BY category_name ASC
        `;

        const [categories] = await db.execute(sql);

        return res.status(200).json({
            success: true,
            message: "Question categories fetched successfully",
            data: categories
        });

    } catch (error) {

        console.error("Get question categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch question categories"
        });

    }

};


// ==========================================
// UPDATE QUESTION CATEGORY
// ==========================================

const updateQuestionCategory = async (req, res) => {

    try {

        const { categoryId } = req.params;

        const {
            category_name,
            description
        } = req.body;

        // Validate ID

        if (
            !Number.isInteger(Number(categoryId)) ||
            Number(categoryId) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });

        }

        // Validate category name

        if (
            typeof category_name !== "string" ||
            !category_name.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });

        }

        if (category_name.trim().length > 100) {

            return res.status(400).json({
                success: false,
                message: "Category name cannot exceed 100 characters"
            });

        }

        if (
            description != null &&
            typeof description !== "string"
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid category description"
            });

        }

        // Check duplicate category

        const duplicateSql = `
            SELECT id
            FROM career_question_categories
            WHERE LOWER(category_name) = LOWER(?)
              AND id != ?
            LIMIT 1
        `;

        const [duplicates] = await db.execute(
            duplicateSql,
            [
                category_name.trim(),
                categoryId
            ]
        );

        if (duplicates.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Another category already uses this name"
            });

        }

        // Update category

        const updateSql = `
            UPDATE career_question_categories

            SET
                category_name = ?,
                description = ?

            WHERE id = ?
        `;

        const [result] = await db.execute(
            updateSql,
            [
                category_name.trim(),
                description?.trim() || null,
                categoryId
            ]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Question category not found"
            });

        }

        return res.status(200).json({
            success: true,
            message: "Question category updated successfully"
        });

    } catch (error) {

        console.error("Update question category error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update question category"
        });

    }

};


// ==========================================
// TOGGLE QUESTION CATEGORY STATUS
// ==========================================

const toggleQuestionCategoryStatus = async (req, res) => {

    try {

        const { categoryId } = req.params;

        if (
            !Number.isInteger(Number(categoryId)) ||
            Number(categoryId) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });

        }

        const sql = `
            UPDATE career_question_categories

            SET is_active = IF(is_active = 1, 0, 1)

            WHERE id = ?
        `;

        const [result] = await db.execute(
            sql,
            [categoryId]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Question category not found"
            });

        }

        return res.status(200).json({
            success: true,
            message: "Question category status updated successfully"
        });

    } catch (error) {

        console.error("Toggle question category status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update category status"
        });

    }

};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    createQuestionCategory,
    getQuestionCategories,
    updateQuestionCategory,
    toggleQuestionCategoryStatus
};
