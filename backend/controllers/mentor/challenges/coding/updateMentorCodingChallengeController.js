const db = require("../../../../config/db");

// ==========================================
// UPDATE MENTOR CODING CHALLENGE
// ==========================================

const updateMentorCodingChallenge = async (req, res) => {

    const mentorId = req.user.id;
    const { challengeId } = req.params;

    const {
        subject_id,
        challenge_type_id,
        title,
        difficulty,
        instructions,
        challenge_content
    } = req.body;


    // ==========================================
    // VALIDATE REQUIRED FIELDS
    // ==========================================

    if (
        !subject_id ||
        !challenge_type_id ||
        !title ||
        !title.trim() ||
        !instructions ||
        !instructions.trim() ||
        !challenge_content ||
        typeof challenge_content !== "object" ||
        Array.isArray(challenge_content)
    ) {
        return res.status(400).json({
            success: false,
            message: "All required coding challenge details must be provided"
        });
    }


    // ==========================================
    // VALIDATE DIFFICULTY
    // ==========================================

    if (!["easy", "medium", "hard"].includes(difficulty)) {
        return res.status(400).json({
            success: false,
            message: "Difficulty must be easy, medium or hard"
        });
    }


    try {

        // ==========================================
        // CHECK MENTOR OWNERSHIP AND DRAFT STATUS
        // ==========================================

        const [challenges] = await db.query(
            `
            SELECT id

            FROM coding_challenges

            WHERE id = ?
              AND created_by = ?
              AND status = 'draft'
            `,
            [challengeId, mentorId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Draft coding challenge not found"
            });
        }


        // ==========================================
        // CHECK ACTIVE SUBJECT
        // ==========================================

        const [subjects] = await db.query(
            `
            SELECT
                s.id,
                ey.id AS education_year_id,
                d.id AS department_id,
                ep.id AS education_program_id

            FROM subjects s

            INNER JOIN education_years ey
                ON ey.id = s.education_year_id

            INNER JOIN departments d
                ON d.id = ey.department_id

            INNER JOIN education_programs ep
                ON ep.id = d.education_program_id

            WHERE s.id = ?
              AND s.status = 'active'
            `,
            [subject_id]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Active subject not found"
            });
        }


        // ==========================================
        // CHECK ACADEMIC ELIGIBILITY
        // ==========================================

        const subject = subjects[0];

        const [eligibleStudents] = await db.query(
            `
            SELECT sp.user_id

            FROM student_profiles sp

            INNER JOIN users student
                ON student.id = sp.user_id

            INNER JOIN mentor_student_relationships msr
                ON msr.student_id = sp.user_id

            WHERE msr.mentor_id = ?
              AND msr.status = 'accepted'
              AND msr.is_active = TRUE

              AND student.role = 'student'
              AND student.status = 'active'

              AND sp.education_program_id = ?
              AND sp.department_id = ?
              AND sp.education_year_id = ?

            LIMIT 1
            `,
            [
                mentorId,
                subject.education_program_id,
                subject.department_id,
                subject.education_year_id
            ]
        );

        if (eligibleStudents.length === 0) {
            return res.status(403).json({
                success: false,
                message: "No eligible connected students found for this subject's academic group."
            });
        }


        // ==========================================
        // CHECK ACTIVE CODING CHALLENGE TYPE
        // ==========================================

        const [types] = await db.query(
            `
            SELECT id

            FROM coding_challenge_types

            WHERE id = ?
              AND status = 'active'
            `,
            [challenge_type_id]
        );

        if (types.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Active coding challenge type not found"
            });
        }


        // ==========================================
        // UPDATE CHALLENGE
        // ==========================================

        const sql = `
            UPDATE coding_challenges

            SET
                subject_id = ?,
                challenge_type_id = ?,
                title = ?,
                difficulty = ?,
                instructions = ?,
                challenge_content = ?

            WHERE id = ?
              AND created_by = ?
              AND status = 'draft'
        `;

        const [result] = await db.query(
            sql,
            [
                subject_id,
                challenge_type_id,
                title.trim(),
                difficulty,
                instructions.trim(),
                JSON.stringify(challenge_content),
                challengeId,
                mentorId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Draft coding challenge not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Mentor Coding Challenge updated successfully"
        });

    } catch (error) {

        console.error(
            "Mentor Coding Challenge Update Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update Mentor Coding Challenge"
        });

    }
};

module.exports = {
    updateMentorCodingChallenge
};