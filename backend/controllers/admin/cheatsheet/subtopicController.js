
const db = require("../../../config/db");

// ==========================================
// GET SUBTOPICS FOR A TOPIC
// ==========================================
const getSubtopics = async (req, res) => {
    try {
        const { topicId } = req.params;

        if (!Number.isInteger(Number(topicId)) || Number(topicId) <= 0) {
            return res.status(400).json({
                message: "Invalid topic ID"
            });
        }

        const [subtopics] = await db.query(
            `SELECT id, topic_id, name, definition,
                    code_example, memory_trick, expected_output,
                    display_order, created_by, created_at, updated_at
             FROM developer_cheat_subtopics
             WHERE topic_id = ?
             ORDER BY display_order ASC, name ASC`,
            [Number(topicId)]
        );

        return res.status(200).json({
            message: "Subtopics fetched successfully",
            subtopics
        });

    } catch (error) {
        console.error("Get subtopics error:", error);

        return res.status(500).json({
            message: "Failed to fetch subtopics"
        });
    }
};

// ==========================================
// CREATE SUBTOPIC
// ==========================================
const createSubtopic = async (req, res) => {
    try {
        const { topicId } = req.params;

        const {
            name,
            definition,
            code_example,
            memory_trick,
            expected_output,
            display_order
        } = req.body;

        if (!Number.isInteger(Number(topicId)) || Number(topicId) <= 0) {
            return res.status(400).json({
                message: "Invalid topic ID"
            });
        }

        if (!name?.trim() || !definition?.trim()) {
            return res.status(400).json({
                message: "Subtopic name and definition are required"
            });
        }

        const [topics] = await db.query(
            `SELECT id FROM developer_cheat_topics WHERE id = ?`,
            [Number(topicId)]
        );

        if (topics.length === 0) {
            return res.status(404).json({
                message: "Topic not found"
            });
        }

        const order = display_order ?? 1;

        if (!Number.isInteger(Number(order)) || Number(order) < 1) {
            return res.status(400).json({
                message: "Display order must be a positive number"
            });
        }

        const [result] = await db.query(
            `INSERT INTO developer_cheat_subtopics
                (topic_id, name, definition, code_example,
                 memory_trick, expected_output, display_order, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                Number(topicId),
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
            message: "Subtopic created successfully",
            subtopic: {
                id: result.insertId,
                topic_id: Number(topicId),
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
                message: "This subtopic already exists for this topic"
            });
        }

        console.error("Create subtopic error:", error);

        return res.status(500).json({
            message: "Failed to create subtopic"
        });
    }
};

// ==========================================
// UPDATE SUBTOPIC
// ==========================================
const updateSubtopic = async (req, res) => {
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
                message: "Invalid subtopic ID"
            });
        }

        if (!name?.trim() || !definition?.trim()) {
            return res.status(400).json({
                message: "Subtopic name and definition are required"
            });
        }

        const order = display_order ?? 1;

        if (!Number.isInteger(Number(order)) || Number(order) < 1) {
            return res.status(400).json({
                message: "Display order must be a positive number"
            });
        }

        const [result] = await db.query(
            `UPDATE developer_cheat_subtopics
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
                "SELECT id FROM developer_cheat_subtopics WHERE id = ?",
                [Number(id)]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    message: "Subtopic not found"
                });
            }
        }

        return res.status(200).json({
            message: "Subtopic updated successfully"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This subtopic already exists for this topic"
            });
        }

        console.error("Update subtopic error:", error);

        return res.status(500).json({
            message: "Failed to update subtopic"
        });
    }
};

// ==========================================
// DELETE SUBTOPIC
// ==========================================
const deleteSubtopic = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid subtopic ID"
            });
        }

        const [result] = await db.query(
            `DELETE FROM developer_cheat_subtopics WHERE id = ?`,
            [Number(id)]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Subtopic not found"
            });
        }

        return res.status(200).json({
            message: "Subtopic deleted successfully"
        });

    } catch (error) {
        console.error("Delete subtopic error:", error);

        return res.status(500).json({
            message: "Failed to delete subtopic"
        });
    }
};

module.exports = {
    getSubtopics,
    createSubtopic,
    updateSubtopic,
    deleteSubtopic
};
