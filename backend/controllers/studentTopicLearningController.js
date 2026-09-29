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
                tlc.visual_content,
                tlc.code_example,
                tlc.common_mistake,
                tlc.where_used
            FROM topic_learning_content tlc
            INNER JOIN subject_topics st
                ON st.id = tlc.topic_id
            WHERE tlc.topic_id = ?
              AND st.status = 'active'
        `;

        const [result] = await db.query(
            sql,
            [topicId]
        );

        if (result.length === 0) {
            return res.status(404).json({
                message: "Learning content not found"
            });
        }

        return res.status(200).json({
            message:
                "Learning content retrieved successfully",
            content: result[0]
        });

    } catch (error) {

        console.error(
            "Get topic learning content error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to retrieve learning content"
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getTopicLearningContent
};