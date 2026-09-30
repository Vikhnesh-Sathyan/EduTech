const db = require("../config/db");

// =====================================================
// GET ALL LEARNING SECTIONS FOR A SUBTOPIC
// =====================================================

const getLearningSections = async (req, res) => {

    const { subtopicId } = req.params;

    try {

        // Get all sections belonging to the selected subtopic
        const sql = `
            SELECT
                id,
                subtopic_id,
                title,
                description,
                display_order,
                status
            FROM learning_sections
            WHERE subtopic_id = ?
            ORDER BY display_order ASC
        `;

        const [result] = await db.query(
            sql,
            [subtopicId]
        );

        return res.status(200).json({
            message:
                "Learning sections retrieved successfully",
            sections: result
        });

    } catch (error) {

        console.error(
            "Get learning sections error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to retrieve learning sections"
        });
    }
};


// =====================================================
// CREATE LEARNING SECTION
// =====================================================

const createLearningSection = async (req, res) => {

    const {
        subtopicId,
        title,
        description
    } = req.body;

    if (!subtopicId || !title?.trim()) {

        return res.status(400).json({
            message:
                "Subtopic and section title are required"
        });
    }

    try {

        // Check that the parent subtopic exists
        const subtopicSql = `
            SELECT
                id
            FROM learning_subtopics
            WHERE id = ?
              AND status = 'active'
        `;

        const [subtopicResult] = await db.query(
            subtopicSql,
            [subtopicId]
        );

        if (subtopicResult.length === 0) {

            return res.status(404).json({
                message:
                    "Subtopic not found"
            });
        }


        // Find the next section order inside this subtopic
        const orderSql = `
            SELECT
                COALESCE(
                    MAX(display_order),
                    0
                ) + 1 AS next_order
            FROM learning_sections
            WHERE subtopic_id = ?
        `;

        const [orderResult] = await db.query(
            orderSql,
            [subtopicId]
        );

        const nextOrder =
            orderResult[0].next_order;


        // Create the learning section
        const insertSql = `
            INSERT INTO learning_sections
            (
                subtopic_id,
                title,
                description,
                display_order
            )
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(
            insertSql,
            [
                subtopicId,
                title.trim(),
                description?.trim() || null,
                nextOrder
            ]
        );

        return res.status(201).json({
            message:
                "Learning section created successfully",
            sectionId:
                result.insertId
        });

    } catch (error) {

        console.error(
            "Create learning section error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to create learning section"
        });
    }
};


// =====================================================
// UPDATE LEARNING SECTION
// =====================================================

const updateLearningSection = async (req, res) => {

    const { sectionId } = req.params;

    const {
        title,
        description
    } = req.body;

    if (!title?.trim()) {

        return res.status(400).json({
            message:
                "Section title is required"
        });
    }

    try {

        // Update section information
        const sql = `
            UPDATE learning_sections
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
                sectionId
            ]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message:
                    "Learning section not found"
            });
        }

        return res.status(200).json({
            message:
                "Learning section updated successfully"
        });

    } catch (error) {

        console.error(
            "Update learning section error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to update learning section"
        });
    }
};


// =====================================================
// UPDATE LEARNING SECTION STATUS
// =====================================================

const updateLearningSectionStatus = async (req, res) => {

    const { sectionId } = req.params;
    const { status } = req.body;

    if (
        !["active", "inactive"].includes(status)
    ) {

        return res.status(400).json({
            message:
                "Invalid section status"
        });
    }

    try {

        // Enable or disable the selected section
        const sql = `
            UPDATE learning_sections
            SET
                status = ?
            WHERE id = ?
        `;

        const [result] = await db.query(
            sql,
            [
                status,
                sectionId
            ]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message:
                    "Learning section not found"
            });
        }

        return res.status(200).json({
            message:
                "Learning section status updated successfully"
        });

    } catch (error) {

        console.error(
            "Update learning section status error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to update learning section status"
        });
    }
};


module.exports = {
    getLearningSections,
    createLearningSection,
    updateLearningSection,
    updateLearningSectionStatus
};