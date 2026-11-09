const db = require("../../../config/db");

// Create a new speaking topic
const createTopic = async ({
    subject_id,
    title,
    prompt,
    category,
    difficulty
}) => {

    const [result] = await db.execute(
        `INSERT INTO english_speaking_topics
        (
            subject_id,
            title,
            prompt,
            category,
            difficulty
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
            subject_id || null,
            title,
            prompt,
            category || null,
            difficulty || "easy"
        ]
    );

    return {
        id: result.insertId,
        subject_id,
        title,
        prompt,
        category,
        difficulty: difficulty || "easy",
        status: "active"
    };
};


// Get all speaking topics
const getAllTopics = async () => {

    const [rows] = await db.execute(
        `SELECT
            id,
            subject_id,
            title,
            prompt,
            category,
            difficulty,
            status,
            created_at,
            updated_at
         FROM english_speaking_topics
         ORDER BY created_at DESC`
    );

    return rows;
};


// Get a single speaking topic
const getTopicById = async (topicId) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM english_speaking_topics
         WHERE id = ?`,
        [topicId]
    );

    return rows[0] || null;
};


// Update a speaking topic
const updateTopic = async (
    topicId,
    {
        subject_id,
        title,
        prompt,
        category,
        difficulty
    }
) => {

    const [result] = await db.execute(
        `UPDATE english_speaking_topics
         SET
            subject_id = ?,
            title = ?,
            prompt = ?,
            category = ?,
            difficulty = ?
         WHERE id = ?`,
        [
            subject_id || null,
            title,
            prompt,
            category || null,
            difficulty,
            topicId
        ]
    );

    return result.affectedRows > 0;
};


// Activate or deactivate a speaking topic
const updateTopicStatus = async (topicId, status) => {

    const [result] = await db.execute(
        `UPDATE english_speaking_topics
         SET status = ?
         WHERE id = ?`,
        [status, topicId]
    );

    return result.affectedRows > 0;
};


// Delete a speaking topic
const deleteTopic = async (topicId) => {

    const [result] = await db.execute(
        `DELETE FROM english_speaking_topics
         WHERE id = ?`,
        [topicId]
    );

    return result.affectedRows > 0;
};


module.exports = {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    updateTopicStatus,
    deleteTopic
};
