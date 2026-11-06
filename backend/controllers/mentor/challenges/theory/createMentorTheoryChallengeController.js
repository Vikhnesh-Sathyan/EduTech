
const db = require("../../../../config/db");

// ==========================================
// VALIDATE THEORY CHALLENGE CONTENT
// ==========================================

const validateChallengeContent = (schema, content) => {

    const allowedFieldTypes = ["text", "textarea", "number", "code"];

    if (!Array.isArray(schema) || schema.length === 0) {
        return {
            valid: false,
            message: "Invalid challenge content schema"
        };
    }

    const validatedContent = {};
    const allowedKeys = schema.map(field => field.key);

    // Reject unexpected fields
    for (const key of Object.keys(content)) {
        if (!allowedKeys.includes(key)) {
            return {
                valid: false,
                message: `Unexpected content field: ${key}`
            };
        }
    }

    for (const field of schema) {

        if (
            !field.key ||
            !field.label ||
            !allowedFieldTypes.includes(field.type)
        ) {
            return {
                valid: false,
                message: "Invalid challenge content schema"
            };
        }

        const value = content[field.key];

        if (
            field.required &&
            (
                value === undefined ||
                value === null ||
                String(value).trim() === ""
            )
        ) {
            return {
                valid: false,
                message: `${field.label} is required`
            };
        }

        if (value === undefined || value === null || value === "") {
            validatedContent[field.key] = "";
            continue;
        }

        if (field.type === "number") {

            const numberValue = Number(value);

            if (!Number.isFinite(numberValue)) {
                return {
                    valid: false,
                    message: `${field.label} must be a valid number`
                };
            }

            validatedContent[field.key] = numberValue;
            continue;
        }

        if (typeof value !== "string") {
            return {
                valid: false,
                message: `${field.label} must contain text`
            };
        }

        validatedContent[field.key] = value.trim();
    }

    return {
        valid: true,
        content: validatedContent
    };
};


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

        // VALIDATE REQUIRED FIELDS

        if (
            !subject_id ||
            !challenge_type_id ||
            typeof title !== "string" ||
            !title.trim() ||
            typeof instructions !== "string" ||
            !instructions.trim() ||
            !challenge_content ||
            typeof challenge_content !== "object" ||
            Array.isArray(challenge_content)
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        // VALIDATE DIFFICULTY

        if (!["easy", "medium", "hard"].includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: "Invalid difficulty level"
            });
        }

        // VERIFY MENTOR ACCOUNT AND PROFILE

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

        // VERIFY SUBJECT

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

        // VERIFY CONNECTED STUDENT ACADEMIC ELIGIBILITY

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

        // GET ACTIVE TYPE AND CONTENT SCHEMA

        const [types] = await db.query(
            `
            SELECT id, content_schema
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

        let contentSchema = types[0].content_schema;

        if (typeof contentSchema === "string") {
            contentSchema = JSON.parse(contentSchema);
        }

        // VALIDATE CONTENT AGAINST DATABASE SCHEMA

        const validation = validateChallengeContent(
            contentSchema,
            challenge_content
        );

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        // CREATE THEORY CHALLENGE

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
                JSON.stringify(validation.content)
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Theory Challenge created successfully",
            challengeId: result.insertId
        });

    } catch (error) {

        console.error("Mentor Theory Challenge Creation Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create Theory Challenge"
        });

    }
};

module.exports = {
    createMentorTheoryChallenge
};
