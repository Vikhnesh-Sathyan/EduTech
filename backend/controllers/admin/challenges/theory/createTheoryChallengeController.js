
const db = require("../../../../config/db");

// ==========================================
// VALIDATE DYNAMIC CHALLENGE CONTENT
// ==========================================

const validateChallengeContent = (schema, content) => {

    const allowedFieldTypes = [
        "text",
        "textarea",
        "number",
        "code"
    ];

    if (!Array.isArray(schema) || schema.length === 0) {
        return {
            valid: false,
            message: "Invalid challenge content schema"
        };
    }

    const validatedContent = {};

    const allowedKeys = schema.map(field => field.key);

    // Reject fields not defined in the selected type
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

        // Check required fields
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

        // Optional fields can remain empty
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            validatedContent[field.key] = "";
            continue;
        }

        // Validate number fields
        if (field.type === "number") {

            const numberValue = Number(value);

            if (
                String(value).trim() === "" ||
                !Number.isFinite(numberValue)
            ) {
                return {
                    valid: false,
                    message: `${field.label} must be a valid number`
                };
            }

            validatedContent[field.key] = numberValue;
            continue;
        }

        // Text, textarea and code fields
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
// CREATE THEORY CHALLENGE
// ==========================================

const createTheoryChallenge = async (req, res) => {

    try {

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
            !title?.trim() ||
            !instructions?.trim() ||
            !challenge_content
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }


        // ==========================================
        // VALIDATE DIFFICULTY
        // ==========================================

        const allowedDifficulties = [
            "easy",
            "medium",
            "hard"
        ];

        if (!allowedDifficulties.includes(difficulty || "easy")) {
            return res.status(400).json({
                success: false,
                message: "Invalid difficulty"
            });
        }


        // ==========================================
        // VALIDATE CHALLENGE CONTENT OBJECT
        // ==========================================

        if (
            typeof challenge_content !== "object" ||
            Array.isArray(challenge_content) ||
            challenge_content === null
        ) {
            return res.status(400).json({
                success: false,
                message: "Challenge content must be a valid JSON object"
            });
        }


        // ==========================================
        // CHECK ACTIVE SUBJECT
        // ==========================================

        const [subjects] = await db.query(
            `SELECT id
             FROM subjects
             WHERE id = ? AND status = 'active'`,
            [subject_id]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Active subject not found"
            });
        }


        // ==========================================
        // GET ACTIVE TYPE AND ITS CONTENT SCHEMA
        // ==========================================

        const [types] = await db.query(
            `SELECT id, content_schema
             FROM theory_challenge_types
             WHERE id = ? AND status = 'active'`,
            [challenge_type_id]
        );

        if (types.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Active Theory Challenge Type not found"
            });
        }


        // ==========================================
        // PARSE CONTENT SCHEMA
        // ==========================================

        let contentSchema = types[0].content_schema;

        if (typeof contentSchema === "string") {
            contentSchema = JSON.parse(contentSchema);
        }


        // ==========================================
        // VALIDATE CONTENT AGAINST SCHEMA
        // ==========================================

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


        // ==========================================
        // INSERT THEORY CHALLENGE
        // ==========================================

        const [result] = await db.query(
            `INSERT INTO theory_challenges
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
            VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [
                subject_id,
                challenge_type_id,
                req.user.id,
                title.trim(),
                difficulty || "easy",
                instructions.trim(),
                JSON.stringify(validation.content)
            ]
        );


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.status(201).json({
            success: true,
            message: "Theory Challenge created successfully",
            challengeId: result.insertId
        });

    } catch (error) {

        console.error("Create Theory Challenge Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating Theory Challenge"
        });

    }
};


module.exports = {
    createTheoryChallenge
};
