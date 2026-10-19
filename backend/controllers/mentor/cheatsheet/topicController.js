
const db = require("../../../config/db");

// ==========================================
// GET TOPICS FOR OWN CATEGORY
// ==========================================
const getTopics = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!Number.isInteger(Number(categoryId)) || Number(categoryId) <= 0) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const [categories] = await db.query(
            `SELECT id
             FROM developer_cheat_categories
             WHERE id = ? AND created_by = ?`,
            [Number(categoryId), req.user.id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                message: "Category not found or you do not own it"
            });
        }

        const [topics] = await db.query(
            `SELECT
                id,
                category_id,
                name,
                definition,
                code_example,
                memory_trick,
                expected_output,
                display_order,
                created_by
             FROM developer_cheat_topics
             WHERE category_id = ?
               AND created_by = ?
             ORDER BY display_order ASC, name ASC`,
            [Number(categoryId), req.user.id]
        );

        return res.status(200).json({
            message: "Topics retrieved successfully",
            topics
        });
    } catch (error) {
        console.error("Get mentor cheat sheet topics error:", error);

        return res.status(500).json({
            message: "Failed to retrieve topics"
        });
    }
};

// ==========================================
// CREATE TOPIC IN OWN CATEGORY
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

        if (!name || !name.trim() || !definition || !definition.trim()) {
            return res.status(400).json({
                message: "Topic name and definition are required"
            });
        }

        const order = Number(display_order ?? 1);

        if (!Number.isInteger(order) || order < 1) {
            return res.status(400).json({
                message: "Display order must be a positive integer"
            });
        }

        const [categories] = await db.query(
            `SELECT id
             FROM developer_cheat_categories
             WHERE id = ? AND created_by = ?`,
            [Number(categoryId), req.user.id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                message: "Category not found or you do not own it"
            });
        }

        const [result] = await db.query(
            `INSERT INTO developer_cheat_topics
                (
                    category_id,
                    name,
                    definition,
                    code_example,
                    memory_trick,
                    expected_output,
                    display_order,
                    created_by
                )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                Number(categoryId),
                name.trim(),
                definition.trim(),
                code_example?.trim() || null,
                memory_trick?.trim() || null,
                expected_output?.trim() || null,
                order,
                req.user.id
            ]
        );

        return res.status(201).json({
            message: "Topic created successfully",
            topicId: result.insertId
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This topic already exists in the category"
            });
        }

        console.error("Create mentor cheat sheet topic error:", error);

        return res.status(500).json({
            message: "Failed to create topic"
        });
    }
};

// ==========================================
// UPDATE OWN TOPIC
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

        if (!name || !name.trim() || !definition || !definition.trim()) {
            return res.status(400).json({
                message: "Topic name and definition are required"
            });
        }

        const order = Number(display_order ?? 1);

        if (!Number.isInteger(order) || order < 1) {
            return res.status(400).json({
                message: "Display order must be a positive integer"
            });
        }

        const [result] = await db.query(
            `UPDATE developer_cheat_topics
             SET
                name = ?,
                definition = ?,
                code_example = ?,
                memory_trick = ?,
                expected_output = ?,
                display_order = ?
             WHERE id = ? AND created_by = ?`,
            [
                name.trim(),
                definition.trim(),
                code_example?.trim() || null,
                memory_trick?.trim() || null,
                expected_output?.trim() || null,
                order,
                Number(id),
                req.user.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Topic not found or you do not own it"
            });
        }

        return res.status(200).json({
            message: "Topic updated successfully"
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This topic already exists in the category"
            });
        }

        console.error("Update mentor cheat sheet topic error:", error);

        return res.status(500).json({
            message: "Failed to update topic"
        });
    }
};

// ==========================================
// DELETE OWN TOPIC
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
            `DELETE FROM developer_cheat_topics
             WHERE id = ? AND created_by = ?`,
            [Number(id), req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Topic not found or you do not own it"
            });
        }

        return res.status(200).json({
            message: "Topic deleted successfully"
        });
    } catch (error) {
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                message: "Cannot delete this topic because it contains subtopics"
            });
        }

        console.error("Delete mentor cheat sheet topic error:", error);

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
