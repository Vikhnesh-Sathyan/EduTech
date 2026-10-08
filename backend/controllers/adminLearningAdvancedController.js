const db = require("../config/db");

// ======================================================
// CREATE / GET ADVANCED SETUP FOR A SUBTOPIC
// ======================================================

const getAdvancedSetup = async (req, res) => {
    try {
        const { subtopicId } = req.params;

        // Get advanced setup
        const [advancedRows] = await db.query(
            `
            SELECT
                id,
                subtopic_id,
                status,
                created_at,
                updated_at
            FROM learning_subtopic_advanced
            WHERE subtopic_id = ?
            `,
            [subtopicId]
        );

        if (advancedRows.length === 0) {
            return res.status(200).json({
                exists: false,
                advanced: null,
                modules: []
            });
        }

        const advanced = advancedRows[0];

        // Get selected modules
        const [modules] = await db.query(
            `
            SELECT
                id,
                module_type,
                display_order,
                created_at
            FROM learning_subtopic_advanced_modules
            WHERE advanced_id = ?
            ORDER BY display_order ASC, id ASC
            `,
            [advanced.id]
        );

        // Get content for each module
        for (const module of modules) {

            const [contentRows] = await db.query(
                `
                SELECT
                    id,
                    advanced_module_id,
                    content_data,
                    created_at,
                    updated_at
                FROM learning_subtopic_advanced_content
                WHERE advanced_module_id = ?
                `,
                [module.id]
            );

            module.content = contentRows.length > 0
                ? contentRows[0]
                : null;
        }

        return res.status(200).json({
            exists: true,
            advanced,
            modules
        });

    } catch (error) {

        console.error(
            "Get Advanced Setup Error:",
            error
        );

        return res.status(500).json({
            message: "Failed to load advanced setup"
        });
    }
};


// ======================================================
// CREATE ADVANCED SETUP
// ======================================================

const createAdvancedSetup = async (req, res) => {
    const connection = await db.getConnection();

    try {

        const { subtopicId, modules } = req.body;

        if (!subtopicId) {
            return res.status(400).json({
                message: "Subtopic ID is required"
            });
        }

        if (!Array.isArray(modules) || modules.length === 0) {
            return res.status(400).json({
                message: "At least one advanced module is required"
            });
        }

        await connection.beginTransaction();

        // Check subtopic exists
        const [subtopicRows] = await connection.query(
            `
            SELECT id
            FROM learning_subtopics
            WHERE id = ?
            `,
            [subtopicId]
        );

        if (subtopicRows.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Subtopic not found"
            });
        }

        // Prevent duplicate Advanced setup
        const [existingRows] = await connection.query(
            `
            SELECT id
            FROM learning_subtopic_advanced
            WHERE subtopic_id = ?
            `,
            [subtopicId]
        );

        if (existingRows.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                message: "Advanced setup already exists for this subtopic"
            });
        }

        // Create Advanced setup
        const [advancedResult] = await connection.query(
            `
            INSERT INTO learning_subtopic_advanced
            (subtopic_id, status)
            VALUES (?, 'active')
            `,
            [subtopicId]
        );

        const advancedId = advancedResult.insertId;

        // Create selected modules
        for (let index = 0; index < modules.length; index++) {

            await connection.query(
                `
                INSERT INTO learning_subtopic_advanced_modules
                (advanced_id, module_type, display_order)
                VALUES (?, ?, ?)
                `,
                [
                    advancedId,
                    modules[index],
                    index + 1
                ]
            );
        }

        await connection.commit();

        return res.status(201).json({
            message: "Advanced setup created successfully",
            advancedId
        });

    } catch (error) {

        await connection.rollback();

        console.error(
            "Create Advanced Setup Error:",
            error
        );

        return res.status(500).json({
            message: "Failed to create advanced setup"
        });

    } finally {
        connection.release();
    }
};

const validateAdvancedModuleContent = (
    moduleType,
    contentData
) => {

    const requiredFields = {

        deep_dive: [
            "title",
            "detailedExplanation"
        ],

        behind_the_scenes: [
            "title",
            "whatHappensInternally"
        ],

        concept_comparison: [
            "title",
            "conceptA",
            "conceptB"
        ],

        debugging: [
            "title",
            "problemDescription",
            "buggyCode",
            "correctCode"
        ],

        real_world_scenario: [
            "title",
            "scenario",
            "problem",
            "howConceptSolvesIt"
        ],

        code_challenge: [
            "title",
            "problemStatement",
            "starterCode"
        ],

        mini_hands_on_coding: [
            "title",
            "task",
            "instructions",
            "starterCode"
        ],

        architecture_design: [
            "title",
            "problem",
            "designApproach"
        ],

        interview_challenge: [
            "title",
            "interviewQuestion",
            "strongAnswer"
        ]
    };


    const fields =
        requiredFields[moduleType];


    // Unknown module type
    if (!fields) {

        return {
            valid: false,
            message: "Invalid advanced module type"
        };

    }


    // Check required fields
    for (const field of fields) {

        const value =
            contentData[field];

        if (
            typeof value !== "string" ||
            !value.trim()
        ) {

            return {
                valid: false,
                message: `${field} is required`
            };

        }

    }


    // Advanced Practice has special validation
    if (moduleType === "advanced_practice") {

        if (
            !Array.isArray(contentData.options) ||
            contentData.options.length !== 4
        ) {

            return {
                valid: false,
                message: "Exactly 4 options are required"
            };

        }


        const hasEmptyOption =
            contentData.options.some(
                option =>
                    typeof option !== "string" ||
                    !option.trim()
            );


        if (hasEmptyOption) {

            return {
                valid: false,
                message: "All 4 options are required"
            };

        }


        const validAnswers = [
            "A",
            "B",
            "C",
            "D"
        ];


        if (
            !validAnswers.includes(
                contentData.correctAnswer
            )
        ) {

            return {
                valid: false,
                message: "A valid correct answer is required"
            };

        }

    }


    return {
        valid: true
    };

};
// ======================================================
// SAVE / UPDATE ADVANCED MODULE CONTENT
// ======================================================

const saveAdvancedModuleContent = async (req, res) => {
    try {

        const { moduleId } = req.params;
        const { contentData } = req.body;


        // Basic content validation
        if (
            !contentData ||
            typeof contentData !== "object" ||
            Array.isArray(contentData)
        ) {

            return res.status(400).json({
                message: "Valid content data is required"
            });

        }


        // Get module type
        const [moduleRows] = await db.query(
            `
            SELECT
                id,
                module_type
            FROM learning_subtopic_advanced_modules
            WHERE id = ?
            `,
            [moduleId]
        );


        // Module does not exist
        if (moduleRows.length === 0) {

            return res.status(404).json({
                message: "Advanced module not found"
            });

        }


        const moduleType =
            moduleRows[0].module_type;


        // Validate according to module type
        const validation =
            validateAdvancedModuleContent(
                moduleType,
                contentData
            );


        if (!validation.valid) {

            return res.status(400).json({
                message: validation.message
            });

        }


        // Check whether content already exists
        const [existingRows] = await db.query(
            `
            SELECT id
            FROM learning_subtopic_advanced_content
            WHERE advanced_module_id = ?
            `,
            [moduleId]
        );


        if (existingRows.length > 0) {

            await db.query(
                `
                UPDATE learning_subtopic_advanced_content
                SET content_data = ?
                WHERE advanced_module_id = ?
                `,
                [
                    JSON.stringify(contentData),
                    moduleId
                ]
            );

        } else {

            await db.query(
                `
                INSERT INTO learning_subtopic_advanced_content
                (
                    advanced_module_id,
                    content_data
                )
                VALUES (?, ?)
                `,
                [
                    moduleId,
                    JSON.stringify(contentData)
                ]
            );

        }


        return res.status(200).json({
            message: "Advanced module content saved successfully"
        });


    } catch (error) {

        console.error(
            "Save Advanced Module Content Error:",
            error
        );


        return res.status(500).json({
            message: "Failed to save advanced module content"
        });

    }
};


// ======================================================
// GET ADVANCED MODULE CONTENT
// ======================================================

const getAdvancedModuleContent = async (req, res) => {
    try {
        const { moduleId } = req.params;

        const [rows] = await db.query(
            `
            SELECT
                id,
                advanced_module_id,
                content_data,
                created_at,
                updated_at
            FROM learning_subtopic_advanced_content
            WHERE advanced_module_id = ?
            `,
            [moduleId]
        );

        if (rows.length === 0) {
            return res.status(200).json({
                content: null
            });
        }

        const content = rows[0];

        // MySQL JSON may already be parsed depending on driver/config.
        if (typeof content.content_data === "string") {
            content.content_data = JSON.parse(
                content.content_data
            );
        }

        return res.status(200).json({
            content
        });

    } catch (error) {

        console.error(
            "Get Advanced Module Content Error:",
            error
        );

        return res.status(500).json({
            message: "Failed to load advanced module content"
        });
    }
};

// ======================================================
// UPDATE ADVANCED MODULES
// ======================================================

const updateAdvancedSetup = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { subtopicId } = req.params;
        const { modules } = req.body;

        if (!Array.isArray(modules) || modules.length === 0) {
            return res.status(400).json({
                message: "At least one advanced module is required"
            });
        }

        await connection.beginTransaction();

        // Find Advanced setup
        const [advancedRows] = await connection.query(
            `
            SELECT id
            FROM learning_subtopic_advanced
            WHERE subtopic_id = ?
            `,
            [subtopicId]
        );

        if (advancedRows.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Advanced setup not found"
            });
        }

        const advancedId = advancedRows[0].id;

        // Get existing modules
        const [existingModules] = await connection.query(
            `
            SELECT id, module_type
            FROM learning_subtopic_advanced_modules
            WHERE advanced_id = ?
            `,
            [advancedId]
        );

        const existingMap = new Map(
            existingModules.map(module => [
                module.module_type,
                module.id
            ])
        );

        // Remove modules that are no longer selected
        for (const existingModule of existingModules) {

            if (!modules.includes(existingModule.module_type)) {

                await connection.query(
                    `
                    DELETE FROM learning_subtopic_advanced_modules
                    WHERE id = ?
                    `,
                    [existingModule.id]
                );
            }
        }

        // Keep existing modules and create new ones
        for (let index = 0; index < modules.length; index++) {

            const moduleType = modules[index];

            if (existingMap.has(moduleType)) {

                // Keep the existing module ID and content
                await connection.query(
                    `
                    UPDATE learning_subtopic_advanced_modules
                    SET display_order = ?
                    WHERE id = ?
                    `,
                    [
                        index + 1,
                        existingMap.get(moduleType)
                    ]
                );

            } else {

                // Create newly selected module
                await connection.query(
                    `
                    INSERT INTO learning_subtopic_advanced_modules
                    (
                        advanced_id,
                        module_type,
                        display_order
                    )
                    VALUES (?, ?, ?)
                    `,
                    [
                        advancedId,
                        moduleType,
                        index + 1
                    ]
                );
            }
        }

        await connection.commit();

        return res.status(200).json({
            message: "Advanced setup updated successfully"
        });

    } catch (error) {

        await connection.rollback();

        console.error(
            "Update Advanced Setup Error:",
            error
        );

        return res.status(500).json({
            message: "Failed to update advanced setup"
        });

    } finally {
        connection.release();
    }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getAdvancedSetup,
    createAdvancedSetup,
    updateAdvancedSetup,
    saveAdvancedModuleContent,
    getAdvancedModuleContent
};