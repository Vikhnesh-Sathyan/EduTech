
const db = require("../../../config/db");

// ==========================================
// GET TOPICS FOR A CATEGORY
// ==========================================
const getTopics = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!Number.isInteger(Number(categoryId)) || Number(categoryId) <= 0) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const [topics] = await db.query(
            `SELECT id, category_id, name, definition,
                    code_example, memory_trick, expected_output,
                    display_order, created_by, created_at, updated_at
             FROM developer_cheat_topics
             WHERE category_id = ?
             ORDER BY display_order ASC, name ASC`,
            [Number(categoryId)]
        );

        return res.status(200).json({
            message: "Topics fetched successfully",
            topics
        });

    } catch (error) {
        console.error("Get topics error:", error);

        return res.status(500).json({
            message: "Failed to fetch topics"
        });
    }
};

// ==========================================
// CREATE TOPIC
// ==========================================
const createTopic = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const {
            name,
            definition,
            code_example,
            memory_trick,
            expected_output,
            display_order
        } = req.body;

        if (!Number.isInteger(Number(categoryId)) || Number(categoryId) <= 0) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        if (!name?.trim() || !definition?.trim()) {
            return res.status(400).json({
                message: "Topic name and definition are required"
            });
        }

        const [categories] = await db.query(
            `SELECT id FROM developer_cheat_categories
             WHERE id = ?`,
            [Number(categoryId)]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        const order = display_order ?? 1;

        if (!Number.isInteger(Number(order)) || Number(order) < 1) {
            return res.status(400).json({
                message: "Display order must be a positive number"
            });
        }

        const [result] = await db.query(
            `INSERT INTO developer_cheat_topics
                (category_id, name, definition, code_example,
                 memory_trick, expected_output, display_order, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                Number(categoryId),
                name.trim(),
                definition.trim(),
                code_example?.trim() || null,
                memory_trick?.trim() || null,
                expected_output?.trim() || null,
                Number(order),
                req.user.id
            ]
        );

        return res.status(201).json({
            message: "Topic created successfully",
            topic: {
                id: result.insertId,
                category_id: Number(categoryId),
                name: name.trim(),
                definition: definition.trim(),
                code_example: code_example?.trim() || null,
                memory_trick: memory_trick?.trim() || null,
                expected_output: expected_output?.trim() || null,
                display_order: Number(order)
            }
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This topic already exists in this category"
            });
        }

        console.error("Create topic error:", error);

        return res.status(500).json({
            message: "Failed to create topic"
        });
    }
};

// ==========================================
// UPDATE TOPIC
// ==========================================
const updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            definition,
            code_example,
            memory_trick,
            expected_output,
            display_order
        } = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid topic ID"
            });
        }

        if (!name?.trim() || !definition?.trim()) {
            return res.status(400).json({
                message: "Topic name and definition are required"
            });
        }

        const order = display_order ?? 1;

        if (!Number.isInteger(Number(order)) || Number(order) < 1) {
            return res.status(400).json({
                message: "Display order must be a positive number"
            });
        }

        const [result] = await db.query(
            `UPDATE developer_cheat_topics
             SET name = ?,
                 definition = ?,
                 code_example = ?,
                 memory_trick = ?,
                 expected_output = ?,
                 display_order = ?
             WHERE id = ?`,
            [
                name.trim(),
                definition.trim(),
                code_example?.trim() || null,
                memory_trick?.trim() || null,
                expected_output?.trim() || null,
                Number(order),
                Number(id)
            ]
        );

        if (result.affectedRows === 0) {
            const [existing] = await db.query(
                "SELECT id FROM developer_cheat_topics WHERE id = ?",
                [Number(id)]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    message: "Topic not found"
                });
            }
        }

        return res.status(200).json({
            message: "Topic updated successfully"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Another topic already uses this name in the category"
            });
        }

        console.error("Update topic error:", error);

        return res.status(500).json({
            message: "Failed to update topic"
        });
    }
};

// ==========================================
// DELETE TOPIC
// ==========================================
const deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid topic ID"
            });
        }

        const [result] = await db.query(
            `DELETE FROM developer_cheat_topics WHERE id = ?`,
            [Number(id)]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Topic not found"
            });
        }

        return res.status(200).json({
            message: "Topic deleted successfully"
        });

    } catch (error) {
        console.error("Delete topic error:", error);

        return res.status(500).json({
            message: "Failed to delete topic"
        });
    }
};

module.exports = {
    getTopics,
    createTopic,
    updateTopic,
    deleteTopic
};
