const db = require("../config/db");

// =====================================================
// GET LEARNING CONTENT FOR A TOPIC
// =====================================================

const getTopicLearningContent = async (req, res) => {
    const { topicId } = req.params;

    try {
        // Get learning content for the selected topic
        const sql = `
            SELECT
                tlc.id,
                tlc.topic_id,
                st.name AS topic_name,
                tlc.simple_explanation,
                tlc.real_world_example,
                tlc.visual_image_url,
                tlc.visual_text,
                tlc.code_example,
                tlc.common_mistake,
                tlc.where_used
            FROM topic_learning_content tlc
            INNER JOIN subject_topics st
                ON st.id = tlc.topic_id
            WHERE tlc.topic_id = ?
              AND st.status = 'active'
        `;

        const [result] = await db.query(sql, [topicId]);

        // Learning content not found
        if (result.length === 0) {
            return res.status(404).json({
                message: "Learning content not found"
            });
        }

        return res.status(200).json({
            message: "Learning content retrieved successfully",
            content: result[0]
        });

    } catch (error) {

        console.error(
            "Get topic learning content error:",
            error
        );

        return res.status(500).json({
            message: "Failed to retrieve learning content"
        });
    }
};


// =====================================================
// CREATE LEARNING CONTENT
// =====================================================

const createTopicLearningContent = async (req, res) => {

    const {
    topicId,
    simpleExplanation,
    realWorldExample,
    visualText,
    codeExample,
    commonMistake,
    whereUsed
} = req.body;

const imageUrl = req.file
    ? `/uploads/learning/${req.file.filename}`
    : null;

    if (!topicId || !simpleExplanation) {
        return res.status(400).json({
            message:
                "Topic and simple explanation are required"
        });
    }

    try {

        // Check whether topic exists
        const topicSql = `
            SELECT id
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

        // Prevent duplicate learning content
        const existingSql = `
            SELECT id
            FROM topic_learning_content
            WHERE topic_id = ?
        `;

        const [existingResult] = await db.query(
            existingSql,
            [topicId]
        );

        if (existingResult.length > 0) {
            return res.status(409).json({
                message:
                    "Learning content already exists for this topic"
            });
        }

        const insertSql = `
            INSERT INTO topic_learning_content
            (
                topic_id,
                simple_explanation,
                real_world_example,
                visual_image_url,
                visual_text,
                code_example,
                common_mistake,
                where_used
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(
            insertSql,
            [
                topicId,
                simpleExplanation,
                realWorldExample || null,
                imageUrl,
                visualText || null,
                codeExample || null,
                commonMistake || null,
                whereUsed || null
            ]
        );

        return res.status(201).json({
            message:
                "Learning content created successfully",
            contentId: result.insertId
        });

    } catch (error) {

        console.error(
            "Create topic learning content error:",
            error
        );

        return res.status(500).json({
            message: "Failed to create learning content"
        });
    }
};


// =====================================================
// UPDATE LEARNING CONTENT
// =====================================================

const updateTopicLearningContent = async (req, res) => {

    const { topicId } = req.params;

    const {
        simpleExplanation,
        realWorldExample,
        visualImageUrl,
        visualText,
        codeExample,
        commonMistake,
        whereUsed
    } = req.body;

    if (!simpleExplanation) {
        return res.status(400).json({
            message:
                "Simple explanation is required"
        });
    }

    try {

        const sql = `
            UPDATE topic_learning_content
            SET
                simple_explanation = ?,
                real_world_example = ?,
                visual_image_url = ?,
                visual_text = ?,
                code_example = ?,
                common_mistake = ?,
                where_used = ?
            WHERE topic_id = ?
        `;

        const [result] = await db.query(
            sql,
            [
                simpleExplanation,
                realWorldExample || null,
                visualImageUrl || null,
                visualText || null,
                codeExample || null,
                commonMistake || null,
                whereUsed || null,
                topicId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message:
                    "Learning content not found"
            });
        }

        return res.status(200).json({
            message:
                "Learning content updated successfully"
        });

    } catch (error) {

        console.error(
            "Update topic learning content error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to update learning content"
        });
    }
};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    getTopicLearningContent,
    createTopicLearningContent,
    updateTopicLearningContent
};