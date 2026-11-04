
const db = require("../../../../config/db");

// ==========================================
// GET STUDENT CODING CHALLENGE BY ID
// ==========================================

const getStudentCodingChallengeById = async (req, res) => {
    try {

        const studentId = req.user.id;
        const { challengeId } = req.params;

        const [challenges] = await db.query(
            `
            SELECT
                cc.id,
                cc.subject_id,
                cc.challenge_type_id,
                cc.title,
                cc.difficulty,
                cc.instructions,
                cc.challenge_content,
                cc.created_by,
                cc.created_at,

                s.name AS subject_name,

                cct.name AS challenge_type_name,
                cct.type_key AS challenge_type_key,
                cct.content_schema,

                creator.name AS created_by_name,
                creator.role AS creator_role

            FROM coding_challenges cc

            INNER JOIN subjects s
                ON s.id = cc.subject_id

            INNER JOIN coding_challenge_types cct
                ON cct.id = cc.challenge_type_id

            INNER JOIN users creator
                ON creator.id = cc.created_by

            WHERE cc.id = ?
              AND cc.status = 'published'
              AND creator.status = 'active'

              AND (
                    creator.role = 'admin'

                    OR

                    (
                        creator.role = 'mentor'

                      AND EXISTS (
    SELECT 1

    FROM mentor_student_relationships msr

    INNER JOIN student_profiles sp
        ON sp.user_id = msr.student_id

    INNER JOIN education_years ey
        ON ey.id = s.education_year_id

    INNER JOIN departments d
        ON d.id = ey.department_id

    INNER JOIN education_programs ep
        ON ep.id = d.education_program_id

    WHERE msr.mentor_id = cc.created_by
      AND msr.student_id = ?
      AND msr.status = 'accepted'
      AND msr.is_active = TRUE

      AND sp.education_program_id = ep.id
      AND sp.department_id = d.id
      AND sp.education_year_id = ey.id
)
                    )
              )

            LIMIT 1
            `,
            [challengeId, studentId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Coding Challenge not found or not available"
            });
        }

        return res.status(200).json({
            success: true,
            challenge: challenges[0]
        });

    } catch (error) {

        console.error(
            "Student Coding Challenge Details Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load Coding Challenge details"
        });

    }
};

module.exports = {
    getStudentCodingChallengeById
};
