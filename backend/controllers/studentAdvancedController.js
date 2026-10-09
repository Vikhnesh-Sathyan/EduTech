const db = require("../config/db");

// ======================================================
// GET ADVANCED LEARNING FOR A STUDENT
// Access is allowed only after passing Basic Challenge.
// ======================================================

const getStudentAdvancedLearning = async (req, res) => {
    try {
        const { subtopicId } = req.params;
        const studentId = req.user.id;

        // Validate subtopic ID.
        if (
            !subtopicId ||
            !Number.isInteger(Number(subtopicId)) ||
            Number(subtopicId) <= 0
        ) {
            return res.status(400).json({
                message: "Valid subtopic ID is required."
            });
        }

        // --------------------------------------------------
        // 1. Verify that the student passed the challenge.
        // --------------------------------------------------

        const [passedAttempts] = await db.query(
            `
            SELECT id
            FROM basic_challenge_attempts
            WHERE student_id = ?
              AND subtopic_id = ?
              AND passed = TRUE
            LIMIT 1
            `,
            [studentId, Number(subtopicId)]
        );

        if (passedAttempts.length === 0) {
            return res.status(403).json({
                message: "Pass the Basic Challenge to unlock Advanced Learning.",
                advancedUnlocked: false
            });
        }

        // --------------------------------------------------
        // 2. Load the active Advanced setup.
        // --------------------------------------------------

        const [advancedRows] = await db.query(
            `
            SELECT
                id,
                subtopic_id,
                status
            FROM learning_subtopic_advanced
            WHERE subtopic_id = ?
              AND status = 'active'
            LIMIT 1
            `,
            [Number(subtopicId)]
        );

        if (advancedRows.length === 0) {
            return res.status(404).json({
                message: "Advanced Learning is not available for this subtopic."
            });
        }

        const advanced = advancedRows[0];

        // --------------------------------------------------
        // 3. Load modules and their saved content.
        // --------------------------------------------------

        const [modules] = await db.query(
            `
            SELECT
                m.id,
                m.module_type,
                m.display_order,
                c.content_data
            FROM learning_subtopic_advanced_modules AS m
            LEFT JOIN learning_subtopic_advanced_content AS c
                ON c.advanced_module_id = m.id
            WHERE m.advanced_id = ?
            ORDER BY m.display_order ASC, m.id ASC
            `,
            [advanced.id]
        );

        // Parse JSON content if the MySQL driver returns strings.
        const formattedModules = modules.map(module => {
            let contentData = module.content_data;

            if (typeof contentData === "string") {
                try {
                    contentData = JSON.parse(contentData);
                } catch {
                    contentData = null;
                }
            }

            return {
                id: module.id,
                moduleType: module.module_type,
                displayOrder: module.display_order,
                content: contentData
            };
        });

        return res.status(200).json({
            advancedUnlocked: true,
            subtopicId: Number(subtopicId),
            advanced,
            modules: formattedModules
        });

    } catch (error) {
        console.error(
            "Get Student Advanced Learning Error:",
            error
        );

        return res.status(500).json({
            message: "Failed to load Advanced Learning."
        });
    }
};

module.exports = {
    getStudentAdvancedLearning
};
