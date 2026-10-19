
const db = require("../../../config/db");

// ==========================================
// GET CATEGORIES FOR A TECHNOLOGY
// ==========================================
const getCategories = async (req, res) => {
    try {
        const { technologyId } = req.params;

        const [categories] = await db.query(
            `SELECT id, technology_id, name, display_order,
                    created_by, created_at, updated_at
             FROM developer_cheat_categories
             WHERE technology_id = ?
             ORDER BY display_order ASC, name ASC`,
            [technologyId]
        );

        return res.status(200).json({
            message: "Categories fetched successfully",
            categories
        });

    } catch (error) {
        console.error("Get categories error:", error);

        return res.status(500).json({
            message: "Failed to fetch categories"
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

        if (!Number.isInteger(Number(technologyId)) ||
            Number(technologyId) <= 0) {
            return res.status(400).json({
                message: "Invalid technology ID"
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const [technology] = await db.query(
            `SELECT id FROM developer_technologies
             WHERE id = ? AND status = 'active'`,
            [Number(technologyId)]
        );

        if (technology.length === 0) {
            return res.status(404).json({
                message: "Active technology not found"
            });
        }

        const order = display_order ?? 1;

        if (!Number.isInteger(Number(order)) || Number(order) < 1) {
            return res.status(400).json({
                message: "Display order must be a positive number"
            });
        }

        const [result] = await db.query(
            `INSERT INTO developer_cheat_categories
                (technology_id, name, display_order, created_by)
             VALUES (?, ?, ?, ?)`,
            [
                Number(technologyId),
                name.trim(),
                Number(order),
                req.user.id
            ]
        );

        return res.status(201).json({
            message: "Category created successfully",
            category: {
                id: result.insertId,
                technology_id: Number(technologyId),
                name: name.trim(),
                display_order: Number(order)
            }
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This category already exists for this technology"
            });
        }

        console.error("Create category error:", error);

        return res.status(500).json({
            message: "Failed to create category"
        });
    }
};

// ==========================================
// UPDATE CATEGORY
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

        const order = display_order ?? 1;

        if (!Number.isInteger(Number(order)) || Number(order) < 1) {
            return res.status(400).json({
                message: "Display order must be a positive number"
            });
        }

        const [result] = await db.query(
            `UPDATE developer_cheat_categories
             SET name = ?, display_order = ?
             WHERE id = ?`,
            [name.trim(), Number(order), Number(id)]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        return res.status(200).json({
            message: "Category updated successfully"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This category already exists for this technology"
            });
        }

        console.error("Update category error:", error);

        return res.status(500).json({
            message: "Failed to update category"
        });
    }
};

// ==========================================
// DELETE CATEGORY
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
             WHERE id = ?`,
            [Number(id)]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        return res.status(200).json({
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error("Delete category error:", error);

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
