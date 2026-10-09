const db = require("../../config/db");


// =====================================================
// GET PROJECT CATEGORIES
// =====================================================

const getProjectCategories = async (req, res) => {
    try {

        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                description,
                display_order,
                status,
                created_at,
                updated_at
            FROM project_categories
            ORDER BY display_order ASC
            `
        );

        res.status(200).json(rows);

    } catch (error) {

        console.error(
            "Error fetching project categories:",
            error
        );

        res.status(500).json({
            message: "Failed to load project categories"
        });
    }
};


// =====================================================
// GET PROJECT TOPICS BY CATEGORY
// =====================================================

const getProjectTopics = async (req, res) => {
    try {

        const categoryId =
            Number(req.params.categoryId);

        if (!categoryId) {
            return res.status(400).json({
                message: "Category ID is required"
            });
        }

        const [rows] = await db.query(
            `
            SELECT
                id,
                category_id,
                name,
                description,
                display_order,
                status,
                created_at,
                updated_at
            FROM project_topics
            WHERE category_id = ?
            ORDER BY display_order ASC
            `,
            [categoryId]
        );

        res.status(200).json(rows);

    } catch (error) {

        console.error(
            "Error fetching project topics:",
            error
        );

        res.status(500).json({
            message: "Failed to load project topics"
        });
    }
};

// =====================================================
// CREATE PROJECT TOPIC
// =====================================================

const createProjectTopic = async (req, res) => {
    try {

        const categoryId =
            Number(req.params.categoryId);

        const {
            name,
            description,
            display_order
        } = req.body;

        if (!categoryId) {
            return res.status(400).json({
                message: "Category ID is required"
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Topic name is required"
            });
        }

        if (!display_order) {
            return res.status(400).json({
                message: "Display order is required"
            });
        }

        // Check whether the category exists
        const [category] = await db.query(
            `
            SELECT id
            FROM project_categories
            WHERE id = ?
            `,
            [categoryId]
        );

        if (category.length === 0) {
            return res.status(404).json({
                message: "Project category not found"
            });
        }

        // Create topic
        const [result] = await db.query(
            `
            INSERT INTO project_topics
            (
                category_id,
                name,
                description,
                display_order
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                categoryId,
                name.trim(),
                description || null,
                display_order
            ]
        );

        res.status(201).json({
            message: "Project topic created successfully",
            topicId: result.insertId
        });

    } catch (error) {

        console.error(
            "Error creating project topic:",
            error
        );

        res.status(500).json({
            message: "Failed to create project topic"
        });
    }
};


// =====================================================
// UPDATE PROJECT TOPIC
// =====================================================

const updateProjectTopic = async (req, res) => {
    try {

        const topicId =
            Number(req.params.topicId);

        const {
            name,
            description,
            display_order,
            status
        } = req.body;

        if (!topicId) {
            return res.status(400).json({
                message: "Topic ID is required"
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Topic name is required"
            });
        }

        await db.query(
            `
            UPDATE project_topics
            SET
                name = ?,
                description = ?,
                display_order = ?,
                status = ?
            WHERE id = ?
            `,
            [
                name.trim(),
                description || null,
                display_order,
                status || "active",
                topicId
            ]
        );

        res.status(200).json({
            message: "Project topic updated successfully"
        });

    } catch (error) {

        console.error(
            "Error updating project topic:",
            error
        );

        res.status(500).json({
            message: "Failed to update project topic"
        });
    }
};


// =====================================================
// DELETE PROJECT TOPIC
// =====================================================

const deleteProjectTopic = async (req, res) => {
    try {

        const topicId =
            Number(req.params.topicId);

        if (!topicId) {
            return res.status(400).json({
                message: "Topic ID is required"
            });
        }

        await db.query(
            `
            DELETE FROM project_topics
            WHERE id = ?
            `,
            [topicId]
        );

        res.status(200).json({
            message: "Project topic deleted successfully"
        });

    } catch (error) {

        console.error(
            "Error deleting project topic:",
            error
        );

        res.status(500).json({
            message: "Failed to delete project topic"
        });
    }
};

// =====================================================
// GET PROJECT SECTIONS BY TOPIC
// =====================================================

const getProjectSections = async (req, res) => {
    try {

        const topicId =
            Number(req.params.topicId);

        if (!topicId) {
            return res.status(400).json({
                message: "Topic ID is required"
            });
        }

        const [rows] = await db.query(
            `
            SELECT
                id,
                topic_id,
                title,
                description,
                display_order,
                status,
                created_at,
                updated_at
            FROM project_sections
            WHERE topic_id = ?
            ORDER BY display_order ASC
            `,
            [topicId]
        );

        res.status(200).json(rows);

    } catch (error) {

        console.error(
            "Error fetching project sections:",
            error
        );

        res.status(500).json({
            message: "Failed to load project sections"
        });
    }
};


// =====================================================
// CREATE PROJECT SECTION
// =====================================================

const createProjectSection = async (req, res) => {
    try {

        const topicId =
            Number(req.params.topicId);

        const {
            title,
            description,
            display_order
        } = req.body;

        if (!topicId) {
            return res.status(400).json({
                message: "Topic ID is required"
            });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Section title is required"
            });
        }

        if (!display_order) {
            return res.status(400).json({
                message: "Display order is required"
            });
        }

        // Check whether the topic exists
        const [topic] = await db.query(
            `
            SELECT id
            FROM project_topics
            WHERE id = ?
            `,
            [topicId]
        );

        if (topic.length === 0) {
            return res.status(404).json({
                message: "Project topic not found"
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO project_sections
            (
                topic_id,
                title,
                description,
                display_order
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                topicId,
                title.trim(),
                description || null,
                display_order
            ]
        );

        res.status(201).json({
            message: "Project section created successfully",
            sectionId: result.insertId
        });

    } catch (error) {

        console.error(
            "Error creating project section:",
            error
        );

        res.status(500).json({
            message: "Failed to create project section"
        });
    }
};


// =====================================================
// UPDATE PROJECT SECTION
// =====================================================

const updateProjectSection = async (req, res) => {
    try {

        const sectionId =
            Number(req.params.sectionId);

        const {
            title,
            description,
            display_order,
            status
        } = req.body;

        if (!sectionId) {
            return res.status(400).json({
                message: "Section ID is required"
            });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Section title is required"
            });
        }

        await db.query(
            `
            UPDATE project_sections
            SET
                title = ?,
                description = ?,
                display_order = ?,
                status = ?
            WHERE id = ?
            `,
            [
                title.trim(),
                description || null,
                display_order,
                status || "active",
                sectionId
            ]
        );

        res.status(200).json({
            message: "Project section updated successfully"
        });

    } catch (error) {

        console.error(
            "Error updating project section:",
            error
        );

        res.status(500).json({
            message: "Failed to update project section"
        });
    }
};


// =====================================================
// DELETE PROJECT SECTION
// =====================================================

const deleteProjectSection = async (req, res) => {
    try {

        const sectionId =
            Number(req.params.sectionId);

        if (!sectionId) {
            return res.status(400).json({
                message: "Section ID is required"
            });
        }

        await db.query(
            `
            DELETE FROM project_sections
            WHERE id = ?
            `,
            [sectionId]
        );

        res.status(200).json({
            message: "Project section deleted successfully"
        });

    } catch (error) {

        console.error(
            "Error deleting project section:",
            error
        );

        res.status(500).json({
            message: "Failed to delete project section"
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
// UPDATE PROJECT CATEGORY
// =====================================================

const updateProjectCategory = async (req, res) => {
    try {

        const categoryId =
            Number(req.params.categoryId);

        const {
            name,
            description,
            display_order,
            status
        } = req.body;

        // Validate category ID
        if (!categoryId) {
            return res.status(400).json({
                message: "Valid category ID is required"
            });
        }

        // Validate category name
        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        // Check whether category exists
        const [existing] = await db.query(
            `
            SELECT id
            FROM project_categories
            WHERE id = ?
            `,
            [categoryId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: "Project category not found"
            });
        }

        // Check duplicate category name
        const [duplicate] = await db.query(
            `
            SELECT id
            FROM project_categories
            WHERE name = ?
            AND id != ?
            `,
            [
                name,
                categoryId
            ]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                message: "Category name already exists"
            });
        }

        // Update category
        await db.query(
            `
            UPDATE project_categories
            SET
                name = ?,
                description = ?,
                display_order = ?,
                status = ?
            WHERE id = ?
            `,
            [
                name,
                description || null,
                display_order,
                status || 'active',
                categoryId
            ]
        );

        res.status(200).json({
            message: "Project category updated successfully"
        });

    } catch (error) {

        console.error(
            "Update project category error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }
};

// =====================================================
// DELETE PROJECT CATEGORY
// =====================================================

const deleteProjectCategory = async (req, res) => {
    try {

        const categoryId =
            Number(req.params.categoryId);

        // Validate category ID
        if (!categoryId) {
            return res.status(400).json({
                message: "Valid category ID is required"
            });
        }

        // Check whether category exists
        const [existing] = await db.query(
            `
            SELECT id
            FROM project_categories
            WHERE id = ?
            `,
            [categoryId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: "Project category not found"
            });
        }

        // Delete category
        await db.query(
            `
            DELETE FROM project_categories
            WHERE id = ?
            `,
            [categoryId]
        );

        res.status(200).json({
            message: "Project category deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete project category error:",
            error
        );

        res.status(500).json({
            message:
                "Category cannot be deleted because it contains topics"
        });

    }
};

module.exports = {
    getProjectCategories,
    createProjectCategory,
    updateProjectCategory,
    deleteProjectCategory,

    getProjectTopics,
    createProjectTopic,
    updateProjectTopic,
    deleteProjectTopic,

    getProjectSections,
    createProjectSection,
    updateProjectSection,
    deleteProjectSection
};
