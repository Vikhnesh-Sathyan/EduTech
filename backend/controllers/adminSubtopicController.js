const db = require("../config/db");

// GET ALL SUBTOPICS FOR A TOPIC
const getSubtopics = async (req, res) => {
    const { topicId } = req.params;

    try {
        // Get all subtopics belonging to the selected topic
        const sql = `
            SELECT
                id,
                topic_id,
                title,
                description,
                display_order,
                status
            FROM learning_subtopics
            WHERE topic_id = ?
            ORDER BY display_order ASC
        `;

        const [result] = await db.query(
            sql,
            [topicId]
        );

        return res.status(200).json({
            message: "Subtopics retrieved successfully",
            subtopics: result
        });

    } catch (error) {
        console.error(
            "Get subtopics error:",
            error
        );

        return res.status(500).json({
            message: "Failed to retrieve subtopics"
        });
    }
};


// CREATE SUBTOPIC
const createSubtopic = async (req, res) => {
    const {
        topicId,
        title,
        description
    } = req.body;

    if (!topicId || !title?.trim()) {
        return res.status(400).json({
            message: "Topic and subtopic title are required"
        });
    }

    try {
        // Check that the parent topic exists
        const topicSql = `
            SELECT
                id
            FROM subject_topics
            WHERE id = ?
              AND status = 'active'
        `;

        const [topicResult] = await db.query(
            topicSql,
            [topicId]
        );

        if (topicResult.length === 0) {
            return res.status(404).json({
                message: "Topic not found"
            });
        }


        // Find the next display order
        const orderSql = `
            SELECT
                COALESCE(
                    MAX(display_order),
                    0
                ) + 1 AS next_order
            FROM learning_subtopics
            WHERE topic_id = ?
        `;

        const [orderResult] = await db.query(
            orderSql,
            [topicId]
        );

        const nextOrder =
            orderResult[0].next_order;


        // Create the subtopic
        const insertSql = `
            INSERT INTO learning_subtopics
            (
                topic_id,
                title,
                description,
                display_order
            )
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(
            insertSql,
            [
                topicId,
                title.trim(),
                description?.trim() || null,
                nextOrder
            ]
        );

        return res.status(201).json({
            message: "Subtopic created successfully",
            subtopicId: result.insertId
        });

    } catch (error) {
        console.error(
            "Create subtopic error:",
            error
        );

        return res.status(500).json({
            message: "Failed to create subtopic"
        });
    }
};


// UPDATE SUBTOPIC
const updateSubtopic = async (req, res) => {
    const { subtopicId } = req.params;

    const {
        title,
        description
    } = req.body;

    if (!title?.trim()) {
        return res.status(400).json({
            message: "Subtopic title is required"
        });
    }

    try {
        // Update the selected subtopic
        const sql = `
            UPDATE learning_subtopics
            SET
                title = ?,
                description = ?
            WHERE id = ?
        `;

        const [result] = await db.query(
            sql,
            [
                title.trim(),
                description?.trim() || null,
                subtopicId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Subtopic not found"
            });
        }

        return res.status(200).json({
            message: "Subtopic updated successfully"
        });

    } catch (error) {
        console.error(
            "Update subtopic error:",
            error
        );

        return res.status(500).json({
            message: "Failed to update subtopic"
        });
    }
};


// UPDATE SUBTOPIC STATUS
const updateSubtopicStatus = async (req, res) => {
    const { subtopicId } = req.params;
    const { status } = req.body;

    if (
        !["active", "inactive"].includes(status)
    ) {
        return res.status(400).json({
            message: "Invalid subtopic status"
        });
    }

    try {
        // Enable or disable the selected subtopic
        const sql = `
            UPDATE learning_subtopics
            SET
                status = ?
            WHERE id = ?
        `;

        const [result] = await db.query(
            sql,
            [
                status,
                subtopicId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Subtopic not found"
            });
        }

        return res.status(200).json({
            message:
                "Subtopic status updated successfully"
        });

    } catch (error) {
        console.error(
            "Update subtopic status error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to update subtopic status"
        });
    }
};


module.exports = {
    getSubtopics,
    createSubtopic,
    updateSubtopic,
    updateSubtopicStatus
};