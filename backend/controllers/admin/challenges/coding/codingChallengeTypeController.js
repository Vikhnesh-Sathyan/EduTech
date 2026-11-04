
const db = require("../../../../config/db");

// ==========================================
// GET ALL CODING CHALLENGE TYPES
// ==========================================

const getCodingChallengeTypes = async (req, res) => {
    try {
        const [challengeTypes] = await db.query(
            `SELECT *
             FROM coding_challenge_types
             ORDER BY created_at DESC`
        );

        res.status(200).json({
            success: true,
            challengeTypes
        });

    } catch (error) {
        console.error("Get Coding Challenge Types Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch coding challenge types"
        });
    }
};


// ==========================================
// CREATE CODING CHALLENGE TYPE
// ==========================================

const createCodingChallengeType = async (req, res) => {
    try {
        const {
            typeKey,
            name,
            description,
            contentSchema
        } = req.body;

        // Validate required fields
        if (!typeKey || !name || !Array.isArray(contentSchema)) {
            return res.status(400).json({
                success: false,
                message: "Type key, name and content schema are required"
            });
        }

        // Validate schema fields
        if (contentSchema.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Content schema cannot be empty"
            });
        }

        for (const field of contentSchema) {
            if (
                !field.key ||
                !field.label ||
                !field.type ||
                typeof field.required !== "boolean"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Each schema field must have key, label, type and required"
                });
            }
        }

        const [result] = await db.query(
            `INSERT INTO coding_challenge_types
            (type_key, name, description, content_schema)
            VALUES (?, ?, ?, ?)`,
            [
                typeKey.trim(),
                name.trim(),
                description || null,
                JSON.stringify(contentSchema)
            ]
        );

        res.status(201).json({
            success: true,
            message: "Coding challenge type created successfully",
            challengeTypeId: result.insertId
        });

    } catch (error) {
        console.error("Create Coding Challenge Type Error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This coding challenge type key already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create coding challenge type"
        });
    }
};


// ==========================================
// EXPORT CONTROLLER FUNCTIONS
// ==========================================

module.exports = {
    getCodingChallengeTypes,
    createCodingChallengeType
};
