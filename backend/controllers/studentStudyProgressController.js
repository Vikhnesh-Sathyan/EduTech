const db = require("../config/db");


// =====================================================
// START / ACCESS LEARNING SECTION
// =====================================================

// Creates or updates the student's progress when
// the student opens a learning section.
const accessLearningSection = async (req, res) => {

    const studentId = req.user.id;
    const sectionId = req.params.sectionId;

    try {

        // =================================================
        // VERIFY SECTION ACCESS
        // =================================================

        // Make sure the section belongs to a subject
        // available to the student's education year.
        const [sections] = await db.query(
            `
            SELECT
                ls.id

            FROM learning_sections ls

            INNER JOIN learning_subtopics lst
                ON lst.id = ls.subtopic_id

            INNER JOIN subject_topics st
                ON st.id = lst.topic_id

            INNER JOIN subjects s
                ON s.id = st.subject_id

            INNER JOIN student_profiles sp
                ON sp.education_year_id = s.education_year_id

            WHERE
                ls.id = ?
                AND ls.status = 'active'
                AND lst.status = 'active'
                AND st.status = 'active'
                AND s.status = 'active'
                AND sp.user_id = ?
            `,
            [sectionId, studentId]
        );


        // =================================================
        // SECTION NOT AVAILABLE
        // =================================================

        if (sections.length === 0) {

            return res.status(404).json({
                message: "Learning section not found"
            });

        }


        // =================================================
        // CHECK EXISTING PROGRESS
        // =================================================

        const [progressRows] = await db.query(
            `
            SELECT
                id,
                status,
                first_accessed_at,
                last_accessed_at,
                completed_at

            FROM student_section_progress

            WHERE
                student_id = ?
                AND section_id = ?
            `,
            [studentId, sectionId]
        );


        // =================================================
        // CREATE FIRST PROGRESS RECORD
        // =================================================

        if (progressRows.length === 0) {

            const [result] = await db.query(
                `
                INSERT INTO student_section_progress (
                    student_id,
                    section_id,
                    status
                )
                VALUES (?, ?, 'in_progress')
                `,
                [studentId, sectionId]
            );


            return res.status(201).json({
                message: "Section progress started",
                progress: {
                    id: result.insertId,
                    student_id: studentId,
                    section_id: Number(sectionId),
                    status: "in_progress"
                }
            });

        }


        // =================================================
        // UPDATE LAST ACCESS
        // =================================================

        await db.query(
            `
            UPDATE student_section_progress

            SET last_accessed_at = CURRENT_TIMESTAMP

            WHERE
                student_id = ?
                AND section_id = ?
            `,
            [studentId, sectionId]
        );


        // =================================================
        // RETURN EXISTING PROGRESS
        // =================================================

        return res.status(200).json({
            message: "Section progress updated",
            progress: progressRows[0]
        });


    } catch (error) {

        console.error(
            "Access learning section progress error:",
            error
        );

        return res.status(500).json({
            message: "Failed to update section progress"
        });

    }

};


// =====================================================
// COMPLETE LEARNING SECTION
// =====================================================

// Marks a learning section as completed for the
// currently logged-in student.
const completeLearningSection = async (req, res) => {

    const studentId = req.user.id;
    const sectionId = req.params.sectionId;

    try {

        // =================================================
        // VERIFY SECTION ACCESS
        // =================================================

        // Make sure the section belongs to a subject
        // available to the student's education year.
        const [sections] = await db.query(
            `
            SELECT
                ls.id

            FROM learning_sections ls

            INNER JOIN learning_subtopics lst
                ON lst.id = ls.subtopic_id

            INNER JOIN subject_topics st
                ON st.id = lst.topic_id

            INNER JOIN subjects s
                ON s.id = st.subject_id

            INNER JOIN student_profiles sp
                ON sp.education_year_id = s.education_year_id

            WHERE
                ls.id = ?
                AND ls.status = 'active'
                AND lst.status = 'active'
                AND st.status = 'active'
                AND s.status = 'active'
                AND sp.user_id = ?
            `,
            [sectionId, studentId]
        );


        // =================================================
        // SECTION NOT AVAILABLE
        // =================================================

        if (sections.length === 0) {

            return res.status(404).json({
                message: "Learning section not found"
            });

        }


        // =================================================
        // CHECK EXISTING PROGRESS
        // =================================================

        const [progressRows] = await db.query(
            `
            SELECT
                id,
                status

            FROM student_section_progress

            WHERE
                student_id = ?
                AND section_id = ?
            `,
            [studentId, sectionId]
        );


        // =================================================
        // NO PROGRESS RECORD
        // =================================================

        if (progressRows.length === 0) {

            return res.status(400).json({
                message: "Section has not been started yet"
            });

        }


        // =================================================
        // ALREADY COMPLETED
        // =================================================

        if (progressRows[0].status === "completed") {

            return res.status(200).json({
                message: "Section is already completed"
            });

        }


        // =================================================
        // MARK AS COMPLETED
        // =================================================

        await db.query(
            `
            UPDATE student_section_progress

            SET
                status = 'completed',
                completed_at = CURRENT_TIMESTAMP,
                last_accessed_at = CURRENT_TIMESTAMP

            WHERE
                student_id = ?
                AND section_id = ?
            `,
            [studentId, sectionId]
        );


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({
            message: "Section completed successfully",
            progress: {
                student_id: studentId,
                section_id: Number(sectionId),
                status: "completed"
            }
        });


    } catch (error) {

        console.error(
            "Complete learning section progress error:",
            error
        );

        return res.status(500).json({
            message: "Failed to complete section"
        });

    }

};



module.exports = {
    accessLearningSection,
    completeLearningSection
};

