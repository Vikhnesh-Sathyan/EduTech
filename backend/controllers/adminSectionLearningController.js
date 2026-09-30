const db = require("../config/db");


// =====================================================
// GET LEARNING CONTENT FOR A SECTION
// =====================================================

const getSectionLearningContent = async (req, res) => {

    const { sectionId } = req.params;

    try {

        // Get section details and optional learning content
        const sql = `
            SELECT
                ls.id AS section_id,
                ls.title AS section_title,

                lst.id AS subtopic_id,
                lst.title AS subtopic_title,

                st.id AS topic_id,
                st.name AS topic_name,

                lsc.id,
                lsc.simple_explanation,
                lsc.real_world_example,
                lsc.visual_image_url,
                lsc.visual_text,
                lsc.code_example,
                lsc.common_mistake,
                lsc.where_used

            FROM learning_sections ls

            INNER JOIN learning_subtopics lst
                ON lst.id = ls.subtopic_id

            INNER JOIN subject_topics st
                ON st.id = lst.topic_id

            LEFT JOIN learning_section_content lsc
                ON lsc.section_id = ls.id

            WHERE ls.id = ?
        `;

        const [result] = await db.query(
            sql,
            [sectionId]
        );


        // Section does not exist
        if (result.length === 0) {

            return res.status(404).json({
                message: "Learning section not found"
            });

        }


        const row = result[0];


        return res.status(200).json({

            // Learning content
            // Can be null when content has not been created yet
            content: row.id
                ? {
                    id: row.id,

                    section_id: row.section_id,

                    simple_explanation:
                        row.simple_explanation,

                    real_world_example:
                        row.real_world_example,

                    visual_image_url:
                        row.visual_image_url,

                    visual_text:
                        row.visual_text,

                    code_example:
                        row.code_example,

                    common_mistake:
                        row.common_mistake,

                    where_used:
                        row.where_used,

                    section_title:
                        row.section_title,

                    subtopic_id:
                        row.subtopic_id,

                    subtopic_title:
                        row.subtopic_title,

                    topic_id:
                        row.topic_id,

                    topic_name:
                        row.topic_name
                }
                : null,


            // Section information is always returned
            section: {

                id:
                    row.section_id,

                title:
                    row.section_title,

                subtopic_id:
                    row.subtopic_id,

                subtopic_title:
                    row.subtopic_title,

                topic_id:
                    row.topic_id,

                topic_name:
                    row.topic_name
            }

        });

    } catch (error) {

        console.error(
            "Get section learning content error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to retrieve section learning content"
        });

    }
};



// =====================================================
// CREATE LEARNING CONTENT FOR A SECTION
// =====================================================

const createSectionLearningContent = async (req, res) => {

    const {
        sectionId,
        simpleExplanation,
        realWorldExample,
        visualText,
        codeExample,
        commonMistake,
        whereUsed
    } = req.body;


    // Image uploaded through Multer
    const visualImageUrl = req.file
        ? `/uploads/learning/${req.file.filename}`
        : null;


    // Required field validation
    if (!sectionId || !simpleExplanation) {

        return res.status(400).json({
            message:
                "Section and simple explanation are required"
        });

    }


    try {

        // =================================================
        // CHECK SECTION
        // =================================================

        const sectionSql = `
            SELECT
                id
            FROM learning_sections
            WHERE id = ?
              AND status = 'active'
        `;

        const [sectionResult] = await db.query(
            sectionSql,
            [sectionId]
        );


        if (sectionResult.length === 0) {

            return res.status(404).json({
                message:
                    "Learning section not found"
            });

        }


        // =================================================
        // CHECK EXISTING CONTENT
        // =================================================

        const existingSql = `
            SELECT
                id
            FROM learning_section_content
            WHERE section_id = ?
        `;

        const [existingResult] = await db.query(
            existingSql,
            [sectionId]
        );


        if (existingResult.length > 0) {

            return res.status(409).json({
                message:
                    "Learning content already exists for this section"
            });

        }


        // =================================================
        // CREATE LEARNING CONTENT
        // =================================================

        const insertSql = `
            INSERT INTO learning_section_content
            (
                section_id,
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

                sectionId,

                simpleExplanation.trim(),

                realWorldExample?.trim() || null,

                visualImageUrl,

                visualText?.trim() || null,

                codeExample?.trim() || null,

                commonMistake?.trim() || null,

                whereUsed?.trim() || null

            ]
        );


        return res.status(201).json({

            message:
                "Learning content created successfully",

            contentId:
                result.insertId

        });

    } catch (error) {

        console.error(
            "Create section learning content error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to create learning content"
        });

    }
};



// =====================================================
// UPDATE LEARNING CONTENT
// =====================================================

const updateSectionLearningContent = async (req, res) => {

    const { sectionId } = req.params;


    const {
        simpleExplanation,
        realWorldExample,
        visualText,
        codeExample,
        commonMistake,
        whereUsed
    } = req.body;


    // Required field validation
    if (!simpleExplanation) {

        return res.status(400).json({
            message:
                "Simple explanation is required"
        });

    }


    try {

        // =================================================
        // GET CURRENT CONTENT
        // =================================================

        const existingSql = `
            SELECT
                id,
                visual_image_url
            FROM learning_section_content
            WHERE section_id = ?
        `;

        const [existingResult] = await db.query(
            existingSql,
            [sectionId]
        );


        if (existingResult.length === 0) {

            return res.status(404).json({
                message:
                    "Learning content not found"
            });

        }


        // Keep the existing image
        // unless a new image was uploaded.
        let visualImageUrl =
            existingResult[0].visual_image_url;


        // =================================================
        // NEW IMAGE UPLOADED
        // =================================================

        if (req.file) {

            visualImageUrl =
                `/uploads/learning/${req.file.filename}`;

        }


        // =================================================
        // UPDATE CONTENT
        // =================================================

        const sql = `
            UPDATE learning_section_content
            SET
                simple_explanation = ?,
                real_world_example = ?,
                visual_image_url = ?,
                visual_text = ?,
                code_example = ?,
                common_mistake = ?,
                where_used = ?
            WHERE section_id = ?
        `;


        await db.query(
            sql,
            [

                simpleExplanation.trim(),

                realWorldExample?.trim() || null,

                visualImageUrl,

                visualText?.trim() || null,

                codeExample?.trim() || null,

                commonMistake?.trim() || null,

                whereUsed?.trim() || null,

                sectionId

            ]
        );


        return res.status(200).json({

            message:
                "Learning content updated successfully"

        });

    } catch (error) {

        console.error(
            "Update section learning content error:",
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

    getSectionLearningContent,

    createSectionLearningContent,

    updateSectionLearningContent

};