
const db = require("../../../../config/db");

// ==========================================
// GET AVAILABLE THEORY CHALLENGES
// ==========================================

const getStudentTheoryChallenges = async (req, res) => {
    try {

        const studentId = req.user.id;

        const [challenges] = await db.query(
            `
            SELECT
                tc.id,
                tc.subject_id,
                tc.challenge_type_id,
                tc.title,
                tc.difficulty,
                tc.instructions,
                tc.created_by,
                tc.created_at,

                s.name AS subject_name,

                tct.name AS challenge_type_name,
                tct.type_key AS challenge_type_key,
                tct.content_schema,

                creator.name AS created_by_name,
                creator.role AS creator_role,

                CASE
                    WHEN creator.role = 'admin'
                    THEN 'admin'

                    WHEN creator.role = 'mentor'
                    THEN 'mentor'
                END AS challenge_source

            FROM theory_challenges tc

            INNER JOIN subjects s
                ON s.id = tc.subject_id

            INNER JOIN theory_challenge_types tct
                ON tct.id = tc.challenge_type_id

            INNER JOIN users creator
                ON creator.id = tc.created_by

            WHERE tc.status = 'published'
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

                            WHERE msr.mentor_id = tc.created_by
                              AND msr.student_id = ?
                              AND msr.status = 'accepted'
                              AND msr.is_active = TRUE
                        )
                    )
              )

            ORDER BY tc.created_at DESC
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
            "Student Theory Challenges Fetch Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load Theory Challenges"
        });

    }
};

module.exports = {
    getStudentTheoryChallenges
};
