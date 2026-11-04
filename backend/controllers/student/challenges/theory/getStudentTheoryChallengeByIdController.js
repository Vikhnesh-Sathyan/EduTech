
const db = require("../../../../config/db");

// ==========================================
// GET THEORY CHALLENGE DETAILS
// ==========================================

const getStudentTheoryChallengeById = async (req, res) => {
    try {

        const studentId = req.user.id;
        const challengeId = req.params.challengeId;

        const [challenges] = await db.query(
            `
            SELECT
                tc.*,

                s.name AS subject_name,

                tct.name AS challenge_type_name,
                tct.type_key AS challenge_type_key,
                tct.content_schema,

                creator.name AS created_by_name,
                creator.role AS creator_role

            FROM theory_challenges tc

            INNER JOIN subjects s
                ON s.id = tc.subject_id

            INNER JOIN theory_challenge_types tct
                ON tct.id = tc.challenge_type_id

            INNER JOIN users creator
                ON creator.id = tc.created_by

            WHERE tc.id = ?
              AND tc.status = 'published'
              AND creator.status = 'active'

              AND (
                    creator.role = 'admin'

                    OR

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

            LIMIT 1
            `,
            [challengeId, studentId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Theory Challenge not found or access denied"
            });
        }

        return res.status(200).json({
            success: true,
            challenge: challenges[0]
        });

    } catch (error) {

        console.error(
            "Student Theory Challenge Details Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load Theory Challenge details"
        });

    }
};

module.exports = {
    getStudentTheoryChallengeById
};
