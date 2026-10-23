
const db = require("../../../config/db");

const getStudentAdvancedLearning = async (req, res) => {
    try {
        const sectionId = Number(req.params.sectionId);
        const studentId = req.user.id;

        if (!Number.isInteger(sectionId) || sectionId <= 0) {
            return res.status(400).json({
                message: "Valid learning section ID is required."
            });
        }

        // 1. Find the selected section and its Advanced setup.
        const [rows] = await db.query(
            `
            SELECT
                a.id AS advanced_id,
                a.subtopic_id,
                a.section_id,
                a.status,
                ls.title AS section_title,
                st.title AS subtopic_title
            FROM learning_sections ls
            JOIN learning_subtopic_advanced a
                ON a.section_id = ls.id
            JOIN learning_subtopics st
                ON st.id = ls.subtopic_id
            WHERE ls.id = ?
              AND a.status = 'active'
            LIMIT 1
            `,
            [sectionId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "No active Advanced Learning setup exists for this section."
            });
        }

        const advanced = rows[0];

        // 2. Preserve the existing Basic Challenge unlock requirement.
        const [passedAttempts] = await db.query(
            `
            SELECT id
            FROM basic_challenge_attempts
            WHERE student_id = ?
              AND subtopic_id = ?
              AND passed = TRUE
            LIMIT 1
            `,
            [studentId, advanced.subtopic_id]
        );

        if (passedAttempts.length === 0) {
            return res.status(403).json({
                message: "Pass the Basic Challenge to unlock Advanced Learning.",
                advancedUnlocked: false
            });
        }

        // 3. Load only modules belonging to this section's setup.
        const [modules] = await db.query(
            `
            SELECT
                m.id,
                m.module_type,
                m.display_order,
                c.content_data
            FROM learning_subtopic_advanced_modules m
            LEFT JOIN learning_subtopic_advanced_content c
                ON c.advanced_module_id = m.id
            WHERE m.advanced_id = ?
            ORDER BY m.display_order ASC, m.id ASC
            `,
            [advanced.advanced_id]
        );

        // 4. Parse saved JSON content safely.
        const formattedModules = modules.map((module) => {
            let content = module.content_data;

            if (typeof content === "string") {
                try {
                    content = JSON.parse(content);
                } catch (error) {
                    content = null;
                }
            }

            return {
                id: module.id,
                moduleType: module.module_type,
                displayOrder: module.display_order,
                content
            };
        });

        return res.status(200).json({
            advancedUnlocked: true,
            sectionId: advanced.section_id,
            sectionTitle: advanced.section_title,
            subtopicId: advanced.subtopic_id,
            subtopicTitle: advanced.subtopic_title,
            advancedId: advanced.advanced_id,
            modules: formattedModules
        });

    } catch (error) {
        console.error("Get Student Advanced Learning Error:", error);

        return res.status(500).json({
            message: "Failed to load Advanced Learning."
        });
    }
};


const getStudentAdvancedSections = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [sections] = await db.query(
            `
            SELECT
                a.id AS advanced_id,
                a.section_id,
                a.subtopic_id,
                ls.title AS section_title,
                st.title AS subtopic_title,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM basic_challenge_attempts bca
                        WHERE bca.student_id = ?
                          AND bca.subtopic_id = a.subtopic_id
                          AND bca.passed = TRUE
                    )
                    THEN TRUE
                    ELSE FALSE
                END AS advanced_unlocked
            FROM learning_subtopic_advanced a
            JOIN learning_sections ls
                ON ls.id = a.section_id
            JOIN learning_subtopics st
                ON st.id = ls.subtopic_id
            WHERE a.status = 'active'
            ORDER BY st.title ASC, ls.title ASC
            `,
            [studentId]
        );

        return res.status(200).json({
            sections: sections.map(section => ({
                advancedId: section.advanced_id,
                sectionId: section.section_id,
                subtopicId: section.subtopic_id,
                sectionTitle: section.section_title,
                subtopicTitle: section.subtopic_title,
                advancedUnlocked:
                    Boolean(section.advanced_unlocked)
            }))
        });

    } catch (error) {
        console.error(
            'Get Student Advanced Sections Error:',
            error
        );

        return res.status(500).json({
            message: 'Failed to load Advanced Learning sections.'
        });
    }
};





const getStudentAdvancedSubjects = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [rows] = await db.query(
            `
            SELECT
                s.id AS subject_id,
                s.name AS subject_name,
                a.id AS advanced_id,
                ls.id AS section_id,
                ls.title AS section_title,
                lst.id AS subtopic_id,
                lst.title AS subtopic_title,

                EXISTS (
                    SELECT 1
                    FROM basic_challenge_attempts bca
                    WHERE bca.student_id = ?
                      AND bca.subtopic_id = lst.id
                      AND bca.passed = TRUE
                ) AS advanced_unlocked

            FROM learning_subtopic_advanced a

            INNER JOIN learning_sections ls
                ON ls.id = a.section_id

            INNER JOIN learning_subtopics lst
                ON lst.id = ls.subtopic_id

            INNER JOIN subject_topics st
                ON st.id = lst.topic_id

            INNER JOIN subjects s
                ON s.id = st.subject_id

            WHERE a.status = 'active'

            ORDER BY s.name ASC, st.id ASC, lst.id ASC, ls.title ASC
            `,
            [studentId]
        );

        const subjectMap = new Map();

        for (const row of rows) {
            if (!subjectMap.has(row.subject_id)) {
                subjectMap.set(row.subject_id, {
                    subjectId: row.subject_id,
                    subjectName: row.subject_name,
                    sections: []
                });
            }

            subjectMap.get(row.subject_id).sections.push({
                advancedId: row.advanced_id,
                sectionId: row.section_id,
                subtopicId: row.subtopic_id,
                sectionTitle: row.section_title,
                subtopicTitle: row.subtopic_title,
                advancedUnlocked: Boolean(row.advanced_unlocked)
            });
        }

        return res.status(200).json({
            subjects: Array.from(subjectMap.values())
        });

    } catch (error) {
        console.error(
            'Get Advanced Learning subjects error:',
            error
        );

        return res.status(500).json({
            message: 'Failed to load Advanced Learning subjects.'
        });
    }
};




module.exports = {
    getStudentAdvancedLearning,
    getStudentAdvancedSections,
    getStudentAdvancedSubjects
};
