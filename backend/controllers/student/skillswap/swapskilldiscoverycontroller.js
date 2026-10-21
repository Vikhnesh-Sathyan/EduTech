
const db = require("../../../config/db");

// ==========================================
// DISCOVER STUDENTS WITH SMART SKILL MATCHING
// ==========================================
const discoverStudents = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { skill_id } = req.query;

        if (
            !skill_id ||
            !Number.isInteger(Number(skill_id)) ||
            Number(skill_id) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid skill_id is required"
            });
        }

        // Confirm the selected skill is active
        const [selectedSkills] = await db.execute(
            `SELECT id, name
             FROM skills
             WHERE id = ? AND status = 'active'
             LIMIT 1`,
            [Number(skill_id)]
        );

        if (selectedSkills.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Skill not found or unavailable"
            });
        }

        // Find students who teach the selected skill.
        // Also check whether they want to learn any skill
        // that the logged-in student can teach.
        const [students] = await db.execute(
            `SELECT
                u.id AS student_id,
                ss.skill_id,
                selected_skill.name AS skill_name,
                ss.proficiency_level,

                EXISTS (
                    SELECT 1
                    FROM student_skills my_teach
                    INNER JOIN student_skills their_learn
                        ON their_learn.skill_id = my_teach.skill_id
                    WHERE my_teach.student_id = ?
                      AND my_teach.skill_type = 'teach'
                      AND their_learn.student_id = u.id
                      AND their_learn.skill_type = 'learn'
                ) AS is_reciprocal_match,

                (
                    SELECT GROUP_CONCAT(
                        DISTINCT their_teach_skill.name
                        ORDER BY their_teach_skill.name
                        SEPARATOR ', '
                    )
                    FROM student_skills their_teach
                    INNER JOIN skills their_teach_skill
                        ON their_teach_skill.id = their_teach.skill_id
                    WHERE their_teach.student_id = u.id
                      AND their_teach.skill_type = 'teach'
                      AND their_teach_skill.status = 'active'
                ) AS teaching_skills,

                (
                    SELECT GROUP_CONCAT(
                        DISTINCT their_learn_skill.name
                        ORDER BY their_learn_skill.name
                        SEPARATOR ', '
                    )
                    FROM student_skills their_learn
                    INNER JOIN skills their_learn_skill
                        ON their_learn_skill.id = their_learn.skill_id
                    WHERE their_learn.student_id = u.id
                      AND their_learn.skill_type = 'learn'
                      AND their_learn_skill.status = 'active'
                ) AS learning_skills

             FROM student_skills ss

             INNER JOIN skills selected_skill
                ON selected_skill.id = ss.skill_id

             INNER JOIN users u
                ON u.id = ss.student_id

             WHERE ss.skill_id = ?
               AND ss.skill_type = 'teach'
               AND selected_skill.status = 'active'
               AND ss.student_id <> ?

             ORDER BY
                is_reciprocal_match DESC,
                CASE ss.proficiency_level
                    WHEN 'advanced' THEN 1
                    WHEN 'intermediate' THEN 2
                    WHEN 'beginner' THEN 3
                    ELSE 4
                END,
                u.id ASC`,

            [
                studentId,
                Number(skill_id),
                studentId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Skill Swap students fetched successfully",
            data: {
                selected_skill: selectedSkills[0],
                students
            }
        });

    } catch (error) {
        console.error("Discover students error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to discover students"
        });
    }
};

module.exports = {
    discoverStudents
};
