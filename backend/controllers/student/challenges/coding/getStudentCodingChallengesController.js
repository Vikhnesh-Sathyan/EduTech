
const db = require("../../../../config/db");

// ==========================================
// GET AVAILABLE CODING CHALLENGES
// ==========================================

const getStudentCodingChallenges = async (req, res) => {
    try {

        const studentId = req.user.id;

        const [challenges] = await db.query(
            `
            SELECT
                cc.id,
                cc.subject_id,
                cc.challenge_type_id,
                cc.title,
                cc.difficulty,
                cc.instructions,
                cc.created_by,
                cc.created_at,

                s.name AS subject_name,
                cct.name AS challenge_type_name,
                cct.type_key AS challenge_type_key,
                cct.content_schema,

                creator.name AS created_by_name,
                creator.role AS creator_role,

                CASE
                    WHEN creator.role = 'admin'
                    THEN 'admin'

                    WHEN creator.role = 'mentor'
                    THEN 'mentor'
                END AS challenge_source

            FROM coding_challenges cc

            INNER JOIN subjects s
                ON s.id = cc.subject_id

            INNER JOIN coding_challenge_types cct
                ON cct.id = cc.challenge_type_id

            INNER JOIN users creator
                ON creator.id = cc.created_by

            WHERE cc.status = 'published'

              AND creator.status = 'active'

              AND (
                    -- Admin challenges are platform-wide
                    creator.role = 'admin'

                    OR

                    -- Mentor challenges require an active relationship
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

            ORDER BY cc.created_at DESC
            `,
            [studentId]
        );

        return res.status(200).json({
            success: true,
            count: challenges.length,
            challenges
        });

    } catch (error) {

        console.error(
            "Student Coding Challenges Fetch Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load Coding Challenges"
        });

    }
};

module.exports = {
    getStudentCodingChallenges
};
