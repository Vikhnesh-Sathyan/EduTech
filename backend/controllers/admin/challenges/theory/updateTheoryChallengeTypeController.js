
const db = require("../../../../config/db");

// ==========================================
// UPDATE THEORY CHALLENGE TYPE
// ==========================================

const updateTheoryChallengeType = async (req, res) => {

    try {

        const { typeId } = req.params;

        const {
            name,
            description,
            contentSchema
        } = req.body;

        // ==========================================
        // VALIDATE NAME
        // ==========================================

        if (!name || !name.trim()) {

            return res.status(400).json({
                success: false,
                message: "Challenge type name is required"
            });

        }

        // ==========================================
        // GET EXISTING TYPE
        // ==========================================

        const [existingTypes] = await db.query(
            `SELECT id, type_key, content_schema
             FROM theory_challenge_types
             WHERE id = ?`,
            [typeId]
        );

        if (existingTypes.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Theory Challenge Type not found"
            });

        }

        const existingType = existingTypes[0];

        // ==========================================
        // CHECK WHETHER CHALLENGES USE THIS TYPE
        // ==========================================

        const [existingChallenges] = await db.query(
            `SELECT id
             FROM theory_challenges
             WHERE challenge_type_id = ?
             LIMIT 1`,
            [typeId]
        );

        const isUsed = existingChallenges.length > 0;

        // ==========================================
        // VALIDATE CONTENT SCHEMA
        // ==========================================

        let schemaToSave = existingType.content_schema;

        if (contentSchema !== undefined) {

            if (
                !Array.isArray(contentSchema) ||
                contentSchema.length === 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "At least one content field is required"
                });

            }

            const allowedFieldTypes = [
                "text",
                "textarea",
                "number",
                "code"
            ];

            for (const field of contentSchema) {

                if (
                    !field.key ||
                    !field.label ||
                    typeof field.required !== "boolean" ||
                    !allowedFieldTypes.includes(field.type)
                ) {

                    return res.status(400).json({
                        success: false,
                        message: "Invalid content field structure"
                    });

                }

            }

            // Compare schemas to determine whether structure changed
            const normalizeSchema = (schema) => {

                if (typeof schema === "string") {
                    schema = JSON.parse(schema);
                }

                return JSON.stringify(schema);

            };

            const schemaChanged =
                normalizeSchema(contentSchema) !==
                normalizeSchema(existingType.content_schema);

            // ==========================================
            // PREVENT STRUCTURAL CHANGES WHEN IN USE
            // ==========================================

            if (isUsed && schemaChanged) {

                return res.status(400).json({
                    success: false,
                    message: "Content fields cannot be changed because challenges already use this type"
                });

            }

            schemaToSave = contentSchema;

        }

        // ==========================================
        // UPDATE THEORY CHALLENGE TYPE
        // ==========================================

        await db.query(
            `UPDATE theory_challenge_types
             SET
                name = ?,
                description = ?,
                content_schema = ?
             WHERE id = ?`,
            [
                name.trim(),
                description?.trim() || null,
                JSON.stringify(schemaToSave),
                typeId
            ]
        );

        return res.status(200).json({

            success: true,
            message: "Theory Challenge Type updated successfully"

        });

    } catch (error) {

        console.error("Update Theory Challenge Type Error:", error);

        return res.status(500).json({

            success: false,
            message: "Server error while updating Theory Challenge Type"

        });

    }

};

module.exports = {
    updateTheoryChallengeType
};
