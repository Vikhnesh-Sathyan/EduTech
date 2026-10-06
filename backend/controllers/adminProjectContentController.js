// =====================================================
// DATABASE CONNECTION
// =====================================================

const db = require("../config/db");


// =====================================================
// GET SECTION CONTENT
// =====================================================

const getProjectSectionContent = async (req, res) => {

    try {

        const sectionId = Number(req.params.sectionId);

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
            "Get project section content error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// CREATE SECTION CONTENT
// =====================================================

const createProjectSectionContent = async (req, res) => {

    try {

        const sectionId = Number(req.params.sectionId);

        const {
            what,
            why,
            flow,
            important_keywords,
            important_code,
            photo_url,
            photo_caption
        } = req.body;


        if (!sectionId || !what) {
            return res.status(400).json({
                message: "Section ID and What content are required"
            });
        }


        // Check whether section exists
        const [section] = await db.query(
            `
            SELECT id
            FROM project_sections
            WHERE id = ?
            `,
            [sectionId]
        );

        if (section.length === 0) {
            return res.status(404).json({
                message: "Project section not found"
            });
        }


        // Check whether content already exists
        const [existing] = await db.query(
            `
            SELECT id
            FROM project_section_content
            WHERE section_id = ?
            `,
            [sectionId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Content already exists for this section"
            });
        }


        // Insert section content
        const [result] = await db.query(
            `
            INSERT INTO project_section_content
            (
                section_id,
                what,
                why,
                flow,
                important_keywords,
                important_code,
                photo_url,
                photo_caption
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                sectionId,
                what,
                why || null,
                flow || null,
                important_keywords || null,
                important_code || null,
                photo_url || null,
                photo_caption || null
            ]
        );


        res.status(201).json({
            message: "Project section content created successfully",
            contentId: result.insertId
        });

    } catch (error) {

        console.error(
            "Create project section content error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// UPDATE SECTION CONTENT
// =====================================================

const updateProjectSectionContent = async (req, res) => {

    try {

        const sectionId = Number(req.params.sectionId);

        const {
            what,
            why,
            flow,
            important_keywords,
            important_code,
            photo_url,
            photo_caption
        } = req.body;


        if (!sectionId || !what) {
            return res.status(400).json({
                message: "Section ID and What content are required"
            });
        }


        // Update section content
        const [result] = await db.query(
            `
            UPDATE project_section_content
            SET
                what = ?,
                why = ?,
                flow = ?,
                important_keywords = ?,
                important_code = ?,
                photo_url = ?,
                photo_caption = ?
            WHERE section_id = ?
            `,
            [
                what,
                why || null,
                flow || null,
                important_keywords || null,
                important_code || null,
                photo_url || null,
                photo_caption || null,
                sectionId
            ]
        );


        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Section content not found"
            });
        }


        res.status(200).json({
            message: "Project section content updated successfully"
        });

    } catch (error) {

        console.error(
            "Update project section content error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};

// =====================================================
// CREATE PROJECT CATEGORY
// =====================================================

const createProjectCategory = async (req, res) => {
    try {

        const {
            name,
            description,
            display_order
        } = req.body;

        // Validate required fields
        if (!name || !display_order) {
            return res.status(400).json({
                message: "Category name and display order are required"
            });
        }

        // Check whether category name already exists
        const [existing] = await db.query(
            `
            SELECT id
            FROM project_categories
            WHERE name = ?
            `,
            [name]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Category already exists"
            });
        }

        // Create category
        const [result] = await db.query(
            `
            INSERT INTO project_categories
            (
                name,
                description,
                display_order
            )
            VALUES (?, ?, ?)
            `,
            [
                name,
                description || null,
                display_order
            ]
        );

        res.status(201).json({
            message: "Project category created successfully",
            categoryId: result.insertId
        });

    } catch (error) {

        console.error(
            "Create project category error:",
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
    getProjectSectionContent,
    createProjectSectionContent,
    updateProjectSectionContent
};