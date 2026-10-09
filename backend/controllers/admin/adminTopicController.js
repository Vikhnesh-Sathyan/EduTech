const db = require("../../config/db");

// ==========================================
// GET TOPICS BY SUBJECT
// ==========================================

const getTopicsBySubject = async (req, res) => {
    try {

        const { subjectId } = req.params;

        const sql = `
            SELECT
                id,
                subject_id,
                name,
                description,
                display_order,
                status
            FROM subject_topics
            WHERE subject_id = ?
            ORDER BY display_order ASC, name ASC
        `;

        const [topics] = await db.query(
            sql,
            [subjectId]
        );

        res.status(200).json({
            topics
        });

    } catch (error) {

        console.error(
            "Get topics by subject error:",
            error
        );

        res.status(500).json({
            message: "Failed to load topics"
        });
    }
};


// ==========================================
// CREATE TOPIC
// ==========================================

const createTopic = async (req, res) => {
    try {

        const {
            subjectId,
            name,
            description,
            displayOrder
        } = req.body;

        if (!subjectId || !name) {

            return res.status(400).json({
                message: "Subject and topic name are required"
            });
        }

        // Check subject exists and is active
        const subjectSql = `
            SELECT id
            FROM subjects
            WHERE id = ?
              AND status = 'active'
        `;

        const [subjectResult] = await db.query(
            subjectSql,
            [subjectId]
        );

        if (subjectResult.length === 0) {

            return res.status(400).json({
                message: "Selected subject is not available"
            });
        }

        // Create topic
        const topicSql = `
            INSERT INTO subject_topics (
                subject_id,
                name,
                description,
                display_order
            )
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(
            topicSql,
            [
                subjectId,
                name,
                description || null,
                displayOrder || 1
            ]
        );

        res.status(201).json({
            message: "Topic created successfully",
            topicId: result.insertId
        });

    } catch (error) {

        console.error(
            "Create topic error:",
            error
        );

        res.status(500).json({
            message: "Failed to create topic"
        });
    }
};
// ==========================================
// UPDATE TOPIC
// ==========================================

const updateTopic = async (req, res) => {
    try {

        const { topicId } = req.params;

        const {
            name,
            description,
            displayOrder
        } = req.body;

        // Check required field
        if (!name) {
            return res.status(400).json({
                message: "Topic name is required"
            });
        }

        // Check topic exists
        const topicSql = `
            SELECT id
            FROM subject_topics
            WHERE id = ?
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

        // Update topic
        const updateSql = `
            UPDATE subject_topics
            SET
                name = ?,
                description = ?,
                display_order = ?
            WHERE id = ?
        `;

        await db.query(
            updateSql,
            [
                name,
                description || null,
                displayOrder || 1,
                topicId
            ]
        );

        res.status(200).json({
            message: "Topic updated successfully"
        });

    } catch (error) {

        console.error(
            "Update topic error:",
            error
        );

        res.status(500).json({
            message: "Failed to update topic"
        });
    }
};

// ==========================================
// UPDATE TOPIC STATUS
// ==========================================

const updateTopicStatus = async (req, res) => {
    try {

        const { topicId } = req.params;
        const { status } = req.body;

        // Check valid status
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                message: "Invalid topic status"
            });
        }

        // Check topic exists
        const topicSql = `
            SELECT id
            FROM subject_topics
            WHERE id = ?
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

        // Update topic status
        const updateSql = `
            UPDATE subject_topics
            SET status = ?
            WHERE id = ?
        `;

        await db.query(
            updateSql,
            [status, topicId]
        );

        res.status(200).json({
            message: "Topic status updated successfully"
        });

    } catch (error) {

        console.error(
            "Update topic status error:",
            error
        );

        res.status(500).json({
            message: "Failed to update topic status"
        });
    }
};

module.exports = {
    getTopicsBySubject,
    createTopic,
    updateTopic,
    updateTopicStatus
};
