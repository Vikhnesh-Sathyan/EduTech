
const db = require("../../../config/db");

// ==========================================
// GET CATEGORIES FOR A TECHNOLOGY
// ==========================================
const getCategories = async (req, res) => {
    try {
        const { technologyId } = req.params;

        if (!Number.isInteger(Number(technologyId)) || Number(technologyId) <= 0) {
            return res.status(400).json({
                message: "Invalid technology ID"
            });
        }

        const [categories] = await db.query(
            `SELECT
                c.id,
                c.technology_id,
                c.name,
                c.display_order,
                c.created_by
             FROM developer_cheat_categories c
             INNER JOIN developer_technologies t
                ON t.id = c.technology_id
             WHERE c.technology_id = ?
               AND t.status = 'active'
             ORDER BY c.display_order ASC, c.name ASC`,
            [Number(technologyId)]
        );

        return res.status(200).json({
            message: "Categories retrieved successfully",
            categories
        });
    } catch (error) {
        console.error("Get mentor cheat sheet categories error:", error);

        return res.status(500).json({
            message: "Failed to retrieve categories"
        });
    }
};

// ==========================================
// CREATE CATEGORY
// ==========================================
const createCategory = async (req, res) => {
    try {
        const { technologyId } = req.params;
        const { name, display_order } = req.body;

        if (!Number.isInteger(Number(technologyId)) || Number(technologyId) <= 0) {
            return res.status(400).json({
                message: "Invalid technology ID"
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const [technologies] = await db.query(
            `SELECT id
             FROM developer_technologies
             WHERE id = ? AND status = 'active'`,
            [Number(technologyId)]
        );

        if (technologies.length === 0) {
            return res.status(404).json({
                message: "Active technology not found"
            });
        }

        const order = Number(display_order ?? 1);

        if (!Number.isInteger(order) || order < 1) {
            return res.status(400).json({
                message: "Display order must be a positive integer"
            });
        }

        const [result] = await db.query(
            `INSERT INTO developer_cheat_categories
                (technology_id, name, display_order, created_by)
             VALUES (?, ?, ?, ?)`,
            [
                Number(technologyId),
                name.trim(),
                order,
                req.user.id
            ]
        );

        return res.status(201).json({
            message: "Category created successfully",
            categoryId: result.insertId
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This category already exists for the technology"
            });
        }

        console.error("Create mentor cheat sheet category error:", error);

        return res.status(500).json({
            message: "Failed to create category"
        });
    }
};

// ==========================================
// UPDATE OWN CATEGORY
// ==========================================
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, display_order } = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const order = Number(display_order ?? 1);

        if (!Number.isInteger(order) || order < 1) {
            return res.status(400).json({
                message: "Display order must be a positive integer"
            });
        }

        const [result] = await db.query(
            `UPDATE developer_cheat_categories
             SET name = ?, display_order = ?
             WHERE id = ? AND created_by = ?`,
            [name.trim(), order, Number(id), req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Category not found or you do not own it"
            });
        }

        return res.status(200).json({
            message: "Category updated successfully"
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This category already exists for the technology"
            });
        }

        console.error("Update mentor cheat sheet category error:", error);

        return res.status(500).json({
            message: "Failed to update category"
        });
    }
};

// ==========================================
// DELETE OWN CATEGORY
// ==========================================
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const [result] = await db.query(
            `DELETE FROM developer_cheat_categories
             WHERE id = ? AND created_by = ?`,
            [Number(id), req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Category not found or you do not own it"
            });
        }

        return res.status(200).json({
            message: "Category deleted successfully"
        });
    } catch (error) {
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                message: "Cannot delete this category because it contains topics"
            });
        }

        console.error("Delete mentor cheat sheet category error:", error);

        return res.status(500).json({
            message: "Failed to delete category"
        });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
