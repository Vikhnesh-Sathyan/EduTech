// =====================================================
// DATABASE CONNECTION
// =====================================================

const db = require("../config/db");


// =====================================================
// GET PROJECT CATEGORIES
// =====================================================

const getStudentProjectCategories = async (req, res) => {

    try {

        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                description,
                display_order
            FROM project_categories
            WHERE status = 'active'
            ORDER BY display_order ASC
            `
        );

        res.status(200).json(rows);

    } catch (error) {

        console.error(
            "Get student project categories error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// GET PROJECT TOPICS
// =====================================================

const getStudentProjectTopics = async (req, res) => {

    try {

        const categoryId =
            Number(req.params.categoryId);

        if (!categoryId) {
            return res.status(400).json({
                message: "Valid category ID is required"
            });
        }


        const [rows] = await db.query(
            `
            SELECT
                id,
                category_id,
                name,
                description,
                display_order
            FROM project_topics
            WHERE category_id = ?
            AND status = 'active'
            ORDER BY display_order ASC
            `,
            [categoryId]
        );


        res.status(200).json(rows);

    } catch (error) {

        console.error(
            "Get student project topics error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// GET PROJECT SECTIONS
// =====================================================

const getStudentProjectSections = async (req, res) => {

    try {

        const topicId =
            Number(req.params.topicId);

        if (!topicId) {
            return res.status(400).json({
                message: "Valid topic ID is required"
            });
        }


        const [rows] = await db.query(
            `
            SELECT
                id,
                topic_id,
                title,
                description,
                display_order
            FROM project_sections
            WHERE topic_id = ?
            AND status = 'active'
            ORDER BY display_order ASC
            `,
            [topicId]
        );


        res.status(200).json(rows);

    } catch (error) {

        console.error(
            "Get student project sections error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// GET SECTION CONTENT
// =====================================================

const getStudentProjectSectionContent = async (req, res) => {

    try {

        const sectionId =
            Number(req.params.sectionId);

        if (!sectionId) {
            return res.status(400).json({
                message: "Valid section ID is required"
            });
        }


        const [rows] = await db.query(
            `
            SELECT
                id,
                section_id,
                what,
                why,
                flow,
                important_keywords,
                important_code,
                photo_url,
                photo_caption
            FROM project_section_content
            WHERE section_id = ?
            `,
            [sectionId]
        );


        if (rows.length === 0) {
            return res.status(404).json({
                message: "Section content not found"
            });
        }


        res.status(200).json(rows[0]);

    } catch (error) {

        console.error(
            "Get student project section content error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    getStudentProjectCategories,
    getStudentProjectTopics,
    getStudentProjectSections,
    getStudentProjectSectionContent
};