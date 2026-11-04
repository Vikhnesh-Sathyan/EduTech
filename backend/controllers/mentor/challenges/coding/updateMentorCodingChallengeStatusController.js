const db = require("../../../../config/db");

// ==========================================
// UPDATE MENTOR CODING CHALLENGE STATUS
// ==========================================

const updateMentorCodingChallengeStatus = async (req, res) => {

    const mentorId = req.user.id;
    const { challengeId } = req.params;
    const { status } = req.body;


    // ==========================================
    // VALIDATE STATUS
    // ==========================================

    if (!["draft", "published", "archived"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid coding challenge status"
        });
    }


    try {

        // ==========================================
        // CHECK MENTOR OWNERSHIP
        // ==========================================

        const [challenges] = await db.query(
            `
            SELECT id, status

            FROM coding_challenges

            WHERE id = ?
              AND created_by = ?
            `,
            [challengeId, mentorId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Coding challenge not found"
            });
        }


        // ==========================================
        // CHECK ACADEMIC ELIGIBILITY BEFORE PUBLISHING
        // ==========================================

        if (status === "published") {

            const [eligibleStudents] = await db.query(
                `
                SELECT sp.user_id

                FROM coding_challenges cc

                INNER JOIN subjects s
                    ON s.id = cc.subject_id

                INNER JOIN education_years ey
                    ON ey.id = s.education_year_id

                INNER JOIN departments d
                    ON d.id = ey.department_id

                INNER JOIN student_profiles sp
                    ON sp.education_program_id = d.education_program_id
                    AND sp.department_id = d.id
                    AND sp.education_year_id = ey.id

                INNER JOIN users student
                    ON student.id = sp.user_id

                INNER JOIN mentor_student_relationships msr
                    ON msr.student_id = sp.user_id

                WHERE cc.id = ?
                  AND msr.mentor_id = ?
                  AND msr.status = 'accepted'
                  AND msr.is_active = TRUE
                  AND student.role = 'student'
                  AND student.status = 'active'

                LIMIT 1
                `,
                [challengeId, mentorId]
            );

            if (eligibleStudents.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "No eligible connected students found for this challenge's academic group."
                });
            }

        }


        // ==========================================
        // UPDATE STATUS
        // ==========================================

        const sql = `
            UPDATE coding_challenges

            SET
                status = ?,

                publish_at = CASE
                    WHEN ? = 'published' THEN CURRENT_TIMESTAMP
                    ELSE NULL
                END

            WHERE id = ?
              AND created_by = ?
        `;

        await db.query(
            sql,
            [status, status, challengeId, mentorId]
        );


        return res.status(200).json({
            success: true,
            message: "Mentor Coding Challenge status updated successfully",
            status
        });

    } catch (error) {

        console.error(
            "Mentor Coding Challenge Status Update Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update Mentor Coding Challenge status"
        });

    }
};

module.exports = {
    updateMentorCodingChallengeStatus
};