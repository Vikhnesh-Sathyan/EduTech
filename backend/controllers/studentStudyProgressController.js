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

// =====================================================
// GET SUBJECT STUDY PROGRESS
// =====================================================

// Calculates study progress for one subject.
//
// Progress is calculated from student_section_progress.
// No separate topic, subtopic, or subject progress
// table is required.
const getSubjectStudyProgress = async (req, res) => {

    const studentId = req.user.id;
    const subjectId = req.params.subjectId;

    try {

        // =================================================
        // VERIFY SUBJECT ACCESS
        // =================================================

        const [subjectRows] = await db.query(
            `
            SELECT
                s.id,
                s.name,
                s.description

            FROM subjects s

            INNER JOIN student_profiles sp
                ON sp.education_year_id = s.education_year_id

            WHERE
                s.id = ?
                AND s.status = 'active'
                AND sp.user_id = ?
            `,
            [subjectId, studentId]
        );


        // =================================================
        // SUBJECT NOT AVAILABLE
        // =================================================

        if (subjectRows.length === 0) {

            return res.status(404).json({
                message: "Subject not found"
            });

        }


        // =================================================
        // GET ALL SECTIONS WITH PROGRESS
        // =================================================

        const [rows] = await db.query(
            `
            SELECT

                st.id AS topic_id,
                st.name AS topic_name,

                lst.id AS subtopic_id,
                lst.title AS subtopic_title,

                ls.id AS section_id,
                ls.title AS section_title,

                COALESCE(
                    ssp.status,
                    'not_started'
                ) AS progress_status

            FROM subject_topics st

            INNER JOIN learning_subtopics lst
                ON lst.topic_id = st.id

            INNER JOIN learning_sections ls
                ON ls.subtopic_id = lst.id

            LEFT JOIN student_section_progress ssp
                ON ssp.section_id = ls.id
                AND ssp.student_id = ?

            WHERE
                st.subject_id = ?
                AND st.status = 'active'
                AND lst.status = 'active'
                AND ls.status = 'active'

            ORDER BY
                st.display_order ASC,
                lst.display_order ASC,
                ls.display_order ASC
            `,
            [studentId, subjectId]
        );


        // =================================================
        // OVERALL SUBJECT PROGRESS
        // =================================================

        const totalSections = rows.length;

        const completedSections = rows.filter(
            section =>
                section.progress_status === 'completed'
        ).length;

        const progressPercentage =
            totalSections === 0
                ? 0
                : Math.round(
                    (completedSections / totalSections) * 100
                );


        // =================================================
        // BUILD TOPIC HIERARCHY
        // =================================================

        const topics = [];


        rows.forEach(row => {

            // ---------------------------------------------
            // FIND OR CREATE TOPIC
            // ---------------------------------------------

            let topic = topics.find(
                item => item.id === row.topic_id
            );


            if (!topic) {

                topic = {
                    id: row.topic_id,
                    name: row.topic_name,
                    total_sections: 0,
                    completed_sections: 0,
                    progress_percentage: 0,
                    subtopics: []
                };

                topics.push(topic);

            }


            // ---------------------------------------------
            // FIND OR CREATE SUBTOPIC
            // ---------------------------------------------

            let subtopic = topic.subtopics.find(
                item => item.id === row.subtopic_id
            );


            if (!subtopic) {

                subtopic = {
                    id: row.subtopic_id,
                    title: row.subtopic_title,
                    total_sections: 0,
                    completed_sections: 0,
                    progress_percentage: 0,
                    sections: []
                };

                topic.subtopics.push(subtopic);

            }


            // ---------------------------------------------
            // SECTION
            // ---------------------------------------------

            const section = {
                id: row.section_id,
                title: row.section_title,
                status: row.progress_status
            };


            subtopic.sections.push(section);


            // ---------------------------------------------
            // UPDATE SUBTOPIC COUNTS
            // ---------------------------------------------

            subtopic.total_sections++;

            if (row.progress_status === 'completed') {

                subtopic.completed_sections++;

            }


            // ---------------------------------------------
            // UPDATE TOPIC COUNTS
            // ---------------------------------------------

            topic.total_sections++;

            if (row.progress_status === 'completed') {

                topic.completed_sections++;

            }

        });


        // =================================================
        // CALCULATE SUBTOPIC + TOPIC PERCENTAGES
        // =================================================

        topics.forEach(topic => {

            topic.progress_percentage =
                topic.total_sections === 0
                    ? 0
                    : Math.round(
                        (
                            topic.completed_sections /
                            topic.total_sections
                        ) * 100
                    );


            topic.subtopics.forEach(subtopic => {

                subtopic.progress_percentage =
                    subtopic.total_sections === 0
                        ? 0
                        : Math.round(
                            (
                                subtopic.completed_sections /
                                subtopic.total_sections
                            ) * 100
                        );

            });

        });


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            subject: subjectRows[0],

            total_sections: totalSections,

            completed_sections: completedSections,

            progress_percentage: progressPercentage,

            topics

        });


    } catch (error) {

        console.error(
            "Get subject study progress error:",
            error
        );

        return res.status(500).json({
            message: "Failed to load subject study progress"
        });

    }

};

// =====================================================
// GET CURRENT STUDY PROGRESS
// =====================================================

// Gets the subject that the student most recently studied
// and returns that subject's current progress.
//
// This is used by the Student Dashboard sidebar.
const getCurrentStudyProgress = async (req, res) => {

    const studentId = req.user.id;

    try {

        // =================================================
        // FIND MOST RECENTLY ACCESSED SECTION
        // =================================================

        const [recentRows] = await db.query(
            `
            SELECT
                ls.id AS section_id,
                s.id AS subject_id

            FROM student_section_progress ssp

            INNER JOIN learning_sections ls
                ON ls.id = ssp.section_id

            INNER JOIN learning_subtopics lst
                ON lst.id = ls.subtopic_id

            INNER JOIN subject_topics st
                ON st.id = lst.topic_id

            INNER JOIN subjects s
                ON s.id = st.subject_id

            WHERE
                ssp.student_id = ?
                AND ls.status = 'active'
                AND lst.status = 'active'
                AND st.status = 'active'
                AND s.status = 'active'

            ORDER BY
                ssp.last_accessed_at DESC

            LIMIT 1
            `,
            [studentId]
        );


        // =================================================
        // NO STUDY ACTIVITY YET
        // =================================================

        if (recentRows.length === 0) {

            return res.status(200).json({
                has_current_study: false,
                current_study: null
            });

        }


        const subjectId = recentRows[0].subject_id;


        // =================================================
        // GET SUBJECT PROGRESS
        // =================================================

        const [progressRows] = await db.query(
            `
            SELECT

                s.id AS subject_id,
                s.name AS subject_name,

                COUNT(ls.id) AS total_sections,

                COUNT(
                    CASE
                        WHEN ssp.status = 'completed'
                        THEN 1
                    END
                ) AS completed_sections

            FROM subjects s

            INNER JOIN subject_topics st
                ON st.subject_id = s.id

            INNER JOIN learning_subtopics lst
                ON lst.topic_id = st.id

            INNER JOIN learning_sections ls
                ON ls.subtopic_id = lst.id

            LEFT JOIN student_section_progress ssp
                ON ssp.section_id = ls.id
                AND ssp.student_id = ?

            WHERE
                s.id = ?
                AND s.status = 'active'
                AND st.status = 'active'
                AND lst.status = 'active'
                AND ls.status = 'active'

            GROUP BY
                s.id,
                s.name
            `,
            [studentId, subjectId]
        );


        // =================================================
        // SUBJECT NOT FOUND
        // =================================================

        if (progressRows.length === 0) {

            return res.status(404).json({
                message: "Current study subject not found"
            });

        }


        const progress = progressRows[0];

        const totalSections =
            Number(progress.total_sections);

        const completedSections =
            Number(progress.completed_sections);

        const progressPercentage =
            totalSections === 0
                ? 0
                : Math.round(
                    (completedSections / totalSections) * 100
                );


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            has_current_study: true,

            current_study: {
                subject_id: Number(progress.subject_id),
                subject_name: progress.subject_name,
                total_sections: totalSections,
                completed_sections: completedSections,
                progress_percentage: progressPercentage
            }

        });


    } catch (error) {

        console.error(
            "Get current study progress error:",
            error
        );

        return res.status(500).json({
            message: "Failed to load current study progress"
        });

    }

};

module.exports = {
    accessLearningSection,
    completeLearningSection,
    getSubjectStudyProgress,
    getCurrentStudyProgress
};

