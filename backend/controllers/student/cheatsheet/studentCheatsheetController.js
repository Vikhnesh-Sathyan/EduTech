
const db = require("../../../config/db");

// ==========================================
// GET TECHNOLOGIES
// ==========================================
const getTechnologies = async (req, res) => {
    try {
        const [technologies] = await db.query(
            `SELECT id, name, sort_name, description
             FROM developer_technologies
             WHERE status = 'active'
             ORDER BY sort_name ASC, name ASC`
        );

        return res.status(200).json({
            message: "Technologies fetched successfully",
            technologies
        });

    } catch (error) {
        console.error("Student cheatsheet technologies error:", error);

        return res.status(500).json({
            message: "Failed to fetch technologies"
        });
    }
};

// ==========================================
// GET CATEGORIES FOR A TECHNOLOGY
// ==========================================
const getCategories = async (req, res) => {
    try {
        const { technologyId } = req.params;

        if (!Number.isInteger(Number(technologyId)) ||
            Number(technologyId) <= 0) {
            return res.status(400).json({
                message: "Invalid technology ID"
            });
        }

        const [categories] = await db.query(
            `SELECT id, technology_id, name, display_order
             FROM developer_cheat_categories
             WHERE technology_id = ?
             ORDER BY display_order ASC, name ASC`,
            [Number(technologyId)]
        );

        return res.status(200).json({
            message: "Categories fetched successfully",
            categories
        });

    } catch (error) {
        console.error("Student cheatsheet categories error:", error);

        return res.status(500).json({
            message: "Failed to fetch categories"
        });
    }
};

// ==========================================
// GET TOPICS FOR A CATEGORY
// ==========================================
const getTopics = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!Number.isInteger(Number(categoryId)) ||
            Number(categoryId) <= 0) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const [topics] = await db.query(
            `SELECT id, category_id, name, definition,
                    code_example, memory_trick, expected_output,
                    display_order
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
        console.error("Student cheatsheet topics error:", error);

        return res.status(500).json({
            message: "Failed to fetch topics"
        });
    }
};

// ==========================================
// GET SUBTOPICS FOR A TOPIC
// ==========================================
const getSubtopics = async (req, res) => {
    try {
        const { topicId } = req.params;

        if (!Number.isInteger(Number(topicId)) ||
            Number(topicId) <= 0) {
            return res.status(400).json({
                message: "Invalid topic ID"
            });
        }

        const [subtopics] = await db.query(
            `SELECT id, topic_id, name, definition,
                    code_example, memory_trick, expected_output,
                    display_order
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
        console.error("Student cheatsheet subtopics error:", error);

        return res.status(500).json({
            message: "Failed to fetch subtopics"
        });
    }
};

module.exports = {
    getTechnologies,
    getCategories,
    getTopics,
    getSubtopics
};
