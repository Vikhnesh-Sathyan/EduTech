const db = require("../../config/db");


// ==========================================
// GET SUBJECTS FOR LOGGED-IN STUDENT
// ==========================================

const getStudentSubjects = async (req, res) => {

    // Student ID comes from the JWT
    const userId = req.user.id;

    try {

        // Find the student's education year
        const sql = `
            SELECT
                sp.education_year_id
            FROM student_profiles sp
            WHERE sp.user_id = ?
        `;

        const [result] = await db.query(
            sql,
            [userId]
        );


        // Student profile does not exist
        if (result.length === 0) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }


        const educationYearId =
            result[0].education_year_id;


        // Student has not selected an education year
        if (!educationYearId) {
            return res.status(400).json({
                message: "Education year is not configured"
            });
        }


        // Get active subjects for that education year
        const subjectSql = `
            SELECT
                id,
                name,
                description
            FROM subjects
            WHERE education_year_id = ?
              AND status = 'active'
            ORDER BY name ASC
        `;

        const [subjects] = await db.query(
            subjectSql,
            [educationYearId]
        );


        res.status(200).json({
            subjects
        });

    } catch (error) {

        console.error(
            "Student subjects lookup failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load subjects"
        });
    }
};


// ==========================================
// GET ONE SUBJECT FOR LOGGED-IN STUDENT
// ==========================================

const getSubjectById = async (req, res) => {

    // Student ID comes from the JWT
    const userId = req.user.id;

    // Subject ID comes from the URL
    const subjectId = req.params.subjectId;

    try {

        // Find the subject only if it belongs
        // to the student's education year
        const sql = `
            SELECT
                s.id,
                s.name,
                s.description
            FROM subjects s
            INNER JOIN student_profiles sp
                ON sp.education_year_id = s.education_year_id
            WHERE sp.user_id = ?
              AND s.id = ?
              AND s.status = 'active'
        `;

        const [result] = await db.query(
            sql,
            [userId, subjectId]
        );


        // Subject does not exist
        // or does not belong to this student's education year
        if (result.length === 0) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }


        res.status(200).json({
            subject: result[0]
        });

    } catch (error) {

        console.error(
            "Subject lookup failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load subject"
        });
    }
};

// ==========================================
// GET LEARNING STRUCTURE FOR ONE SUBJECT
// ==========================================

const getSubjectLearningStructure = async (req, res) => {

    // Student ID comes from the JWT
    const userId = req.user.id;

    // Subject ID comes from the URL
    const subjectId = req.params.subjectId;

    try {

        // ------------------------------------------
        // Verify that the subject belongs to
        // the logged-in student's education year
        // ------------------------------------------

        const subjectSql = `
            SELECT
                s.id,
                s.name
            FROM subjects s
            INNER JOIN student_profiles sp
                ON sp.education_year_id = s.education_year_id
            WHERE sp.user_id = ?
              AND s.id = ?
              AND s.status = 'active'
        `;

        const [subjectResult] = await db.query(
            subjectSql,
            [userId, subjectId]
        );


        // Subject is not available
        if (subjectResult.length === 0) {

            return res.status(404).json({
                message: "Subject not found"
            });

        }


        // ------------------------------------------
        // Get topics
        // ------------------------------------------

        const topicSql = `
            SELECT
                id,
                name,
                description,
                display_order
            FROM subject_topics
            WHERE subject_id = ?
              AND status = 'active'
            ORDER BY display_order ASC
        `;

        const [topics] = await db.query(
            topicSql,
            [subjectId]
        );


        // ------------------------------------------
        // Get subtopics
        // ------------------------------------------

        const subtopicSql = `
            SELECT
                id,
                topic_id,
                title,
                description,
                display_order
            FROM learning_subtopics
            WHERE topic_id IN (
                SELECT id
                FROM subject_topics
                WHERE subject_id = ?
                  AND status = 'active'
            )
            AND status = 'active'
            ORDER BY display_order ASC
        `;

        const [subtopics] = await db.query(
            subtopicSql,
            [subjectId]
        );


        // ------------------------------------------
        // Get sections
        // ------------------------------------------

        const sectionSql = `
            SELECT
                id,
                subtopic_id,
                title,
                description,
                display_order
            FROM learning_sections
            WHERE subtopic_id IN (
                SELECT ls.id
                FROM learning_subtopics ls
                INNER JOIN subject_topics st
                    ON st.id = ls.topic_id
                WHERE st.subject_id = ?
                  AND st.status = 'active'
                  AND ls.status = 'active'
            )
            AND status = 'active'
            ORDER BY display_order ASC
        `;

        const [sections] = await db.query(
            sectionSql,
            [subjectId]
        );


        // ------------------------------------------
        // Build hierarchy
        // ------------------------------------------

        const learningTopics = topics.map(topic => {

            const topicSubtopics =
                subtopics
                    .filter(
                        subtopic =>
                            subtopic.topic_id === topic.id
                    )
                    .map(subtopic => {

                        const subtopicSections =
                            sections.filter(
                                section =>
                                    section.subtopic_id === subtopic.id
                            );

                        return {
                            id: subtopic.id,
                            title: subtopic.title,
                            description: subtopic.description,
                            display_order: subtopic.display_order,
                            sections: subtopicSections
                        };

                    });


            return {
                id: topic.id,
                name: topic.name,
                description: topic.description,
                display_order: topic.display_order,
                subtopics: topicSubtopics
            };

        });


        // ------------------------------------------
        // Send learning structure
        // ------------------------------------------

        return res.status(200).json({

            subject: subjectResult[0],

            topics: learningTopics

        });

    } catch (error) {

        console.error(
            "Student learning structure lookup failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load learning structure"
        });

    }
};

module.exports = {
    getStudentSubjects,
    getSubjectById,
    getSubjectLearningStructure
};
