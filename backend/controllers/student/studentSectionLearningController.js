const db = require("../../config/db");

// Get learning content for one section
const getSectionLearningContent = async (req, res) => {

    try {

        const studentId = req.user.id;
        const sectionId = req.params.sectionId;


        // Verify that this section belongs to a subject
        // available to the logged-in student's education year
        const [rows] = await db.query(
            `
            SELECT
                ls.id,
                ls.title,
                ls.description,

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

            INNER JOIN subjects s
                ON s.id = st.subject_id

            INNER JOIN student_profiles sp
                ON sp.education_year_id = s.education_year_id

            LEFT JOIN learning_section_content lsc
                ON lsc.section_id = ls.id

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


        if (rows.length === 0) {

            return res.status(404).json({
                message: "Learning section not found"
            });

        }


        res.json(rows[0]);

    } catch (error) {

        console.error(
            "Get student section learning content error:",
            error
        );

        res.status(500).json({
            message: "Failed to load learning content"
        });

    }

};


module.exports = {
    getSectionLearningContent
};
