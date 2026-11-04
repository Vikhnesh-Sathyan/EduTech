const db = require("../../../../config/db");

// ==========================================
// CREATE MENTOR THEORY CHALLENGE
// ==========================================

const createMentorTheoryChallenge = async (req, res) => {
    try {

        const mentorId = req.user.id;

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
            typeof title !== "string" ||
            !title.trim() ||
            typeof instructions !== "string" ||
            !instructions.trim() ||
            !challenge_content ||
            typeof challenge_content !== "object" ||
            Array.isArray(challenge_content) ||
            Object.keys(challenge_content).length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        // ==========================================
        // VALIDATE DIFFICULTY
        // ==========================================

        if (
            !["easy", "medium", "hard"].includes(difficulty)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid difficulty level"
            });
        }

        // ==========================================
        // VERIFY MENTOR ACCOUNT AND PROFILE
        // ==========================================

        const [mentors] = await db.query(
            `
            SELECT u.id
            FROM users u
            INNER JOIN mentor_profiles mp
                ON mp.user_id = u.id
            WHERE u.id = ?
              AND u.role = 'mentor'
              AND u.status = 'active'
              AND mp.verification_status = 'approved'
            LIMIT 1
            `,
            [mentorId]
        );

        if (mentors.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only approved and active mentors can create challenges"
            });
        }

        // ==========================================
        // VERIFY SUBJECT
        // ==========================================

        const [subjects] = await db.query(
            `
            SELECT id
            FROM subjects
            WHERE id = ?
              AND status = 'active'
            LIMIT 1
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
        // VERIFY CONNECTED STUDENT ACADEMIC ELIGIBILITY
        // ==========================================

        const [eligibleStudents] = await db.query(
            `
            SELECT sp.user_id
            FROM subjects s

            INNER JOIN education_years ey
                ON ey.id = s.education_year_id

            INNER JOIN departments d
                ON d.id = ey.department_id

            INNER JOIN education_programs ep
                ON ep.id = d.education_program_id

            INNER JOIN student_profiles sp
                ON sp.education_program_id = ep.id
                AND sp.department_id = d.id
                AND sp.education_year_id = ey.id

            INNER JOIN users student
                ON student.id = sp.user_id

            INNER JOIN mentor_student_relationships msr
                ON msr.student_id = sp.user_id

            WHERE s.id = ?
              AND msr.mentor_id = ?
              AND msr.status = 'accepted'
              AND msr.is_active = TRUE
              AND student.role = 'student'
              AND student.status = 'active'

            LIMIT 1
            `,
            [subject_id, mentorId]
        );

        if (eligibleStudents.length === 0) {
            return res.status(403).json({
                success: false,
                message: "No eligible connected students found for this subject's academic group."
            });
        }

        // ==========================================
        // VERIFY THEORY CHALLENGE TYPE
        // ==========================================

        const [types] = await db.query(
            `
            SELECT id
            FROM theory_challenge_types
            WHERE id = ?
              AND status = 'active'
            LIMIT 1
            `,
            [challenge_type_id]
        );

        if (types.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Active Theory Challenge Type not found"
            });
        }

        // ==========================================
        // CREATE THEORY CHALLENGE
        // ==========================================

        const [result] = await db.query(
            `
            INSERT INTO theory_challenges
            (
                subject_id,
                challenge_type_id,
                created_by,
                title,
                difficulty,
                instructions,
                challenge_content,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
            `,
            [
                subject_id,
                challenge_type_id,
                mentorId,
                title.trim(),
                difficulty,
                instructions.trim(),
                JSON.stringify(challenge_content)
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Theory Challenge created successfully",
            challengeId: result.insertId
        });

    } catch (error) {

        console.error(
            "Mentor Theory Challenge Creation Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create Theory Challenge"
        });

    }
};

module.exports = {
    createMentorTheoryChallenge
};