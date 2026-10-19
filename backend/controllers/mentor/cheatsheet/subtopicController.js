
const db = require("../../../config/db");

// GET SUBTOPICS FOR OWN TOPIC
const getSubtopics = async (req, res) => {
    try {
        const { topicId } = req.params;

        if (!Number.isInteger(Number(topicId)) || Number(topicId) <= 0) {
            return res.status(400).json({
                message: "Invalid topic ID"
            });
        }

        const [topics] = await db.query(
            `SELECT id
             FROM developer_cheat_topics
             WHERE id = ? AND created_by = ?`,
            [Number(topicId), req.user.id]
        );

        if (topics.length === 0) {
            return res.status(404).json({
                message: "Topic not found or you do not own it"
            });
        }

        const [subtopics] = await db.query(
            `SELECT
                id,
                topic_id,
                name,
                definition,
                code_example,
                memory_trick,
                expected_output,
                display_order,
                created_by
             FROM developer_cheat_subtopics
             WHERE topic_id = ?
               AND created_by = ?
             ORDER BY display_order ASC, name ASC`,
            [Number(topicId), req.user.id]
        );

        return res.status(200).json({
            message: "Subtopics retrieved successfully",
            subtopics
        });
    } catch (error) {
        console.error("Get mentor cheat sheet subtopics error:", error);

        return res.status(500).json({
            message: "Failed to retrieve subtopics"
        });
    }
};

// CREATE SUBTOPIC IN OWN TOPIC
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

        if (!name || !name.trim() || !definition || !definition.trim()) {
            return res.status(400).json({
                message: "Subtopic name and definition are required"
            });
        }

        const order = Number(display_order ?? 1);

        if (!Number.isInteger(order) || order < 1) {
            return res.status(400).json({
                message: "Display order must be a positive integer"
            });
        }

        const [topics] = await db.query(
            `SELECT id
             FROM developer_cheat_topics
             WHERE id = ? AND created_by = ?`,
            [Number(topicId), req.user.id]
        );

        if (topics.length === 0) {
            return res.status(404).json({
                message: "Topic not found or you do not own it"
            });
        }

        const [result] = await db.query(
            `INSERT INTO developer_cheat_subtopics
                (
                    topic_id,
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
                Number(topicId),
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
            message: "Subtopic created successfully",
            subtopicId: result.insertId
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This subtopic already exists in the topic"
            });
        }

        console.error("Create mentor cheat sheet subtopic error:", error);

        return res.status(500).json({
            message: "Failed to create subtopic"
        });
    }
};

// UPDATE OWN SUBTOPIC
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

        if (!name || !name.trim() || !definition || !definition.trim()) {
            return res.status(400).json({
                message: "Subtopic name and definition are required"
            });
        }

        const order = Number(display_order ?? 1);

        if (!Number.isInteger(order) || order < 1) {
            return res.status(400).json({
                message: "Display order must be a positive integer"
            });
        }

        const [result] = await db.query(
            `UPDATE developer_cheat_subtopics
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
                message: "Subtopic not found or you do not own it"
            });
        }

        return res.status(200).json({
            message: "Subtopic updated successfully"
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This subtopic already exists in the topic"
            });
        }

        console.error("Update mentor cheat sheet subtopic error:", error);

        return res.status(500).json({
            message: "Failed to update subtopic"
        });
    }
};

// DELETE OWN SUBTOPIC
const deleteSubtopic = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid subtopic ID"
            });
        }

        const [result] = await db.query(
            `DELETE FROM developer_cheat_subtopics
             WHERE id = ? AND created_by = ?`,
            [Number(id), req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Subtopic not found or you do not own it"
            });
        }

        return res.status(200).json({
            message: "Subtopic deleted successfully"
        });
    } catch (error) {
        console.error("Delete mentor cheat sheet subtopic error:", error);

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
