const db = require("../../../../config/db");

// ==========================================
// UPDATE CODING CHALLENGE TYPE
// ==========================================

const updateCodingChallengeType = async (req, res) => {

    const { typeId } = req.params;

    const {
        name,
        description,
        contentSchema
    } = req.body;

    try {

        // ==========================================
        // VALIDATE REQUIRED FIELDS
        // ==========================================

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Challenge type name is required"
            });
        }


        // ==========================================
        // CHECK CHALLENGE TYPE
        // ==========================================

        const [types] = await db.query(
            `SELECT id, type_key
             FROM coding_challenge_types
             WHERE id = ?`,
            [typeId]
        );

        if (types.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Coding challenge type not found"
            });
        }


        // ==========================================
        // CHECK WHETHER CHALLENGES USE THIS TYPE
        // ==========================================

        const [challenges] = await db.query(
            `SELECT id
             FROM coding_challenges
             WHERE challenge_type_id = ?
             LIMIT 1`,
            [typeId]
        );

        const isUsed = challenges.length > 0;


        // ==========================================
        // PREVENT SCHEMA CHANGES IF TYPE IS USED
        // ==========================================

        if (contentSchema !== undefined && isUsed) {
            return res.status(400).json({
                success: false,
                message: "Content fields cannot be changed because challenges already use this type"
            });
        }


        // ==========================================
        // VALIDATE CONTENT SCHEMA
        // ==========================================

        if (contentSchema !== undefined) {

            if (
                !Array.isArray(contentSchema) ||
                contentSchema.length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Content schema must contain at least one field"
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
                        message: "Each field must have key, label, type and required"
                    });
                }

                if (
                    !["text", "textarea", "number", "code"].includes(field.type)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid content field type"
                    });
                }
            }
        }


        // ==========================================
        // UPDATE CHALLENGE TYPE
        // ==========================================

        let sql = `
            UPDATE coding_challenge_types
            SET
                name = ?,
                description = ?
        `;

        const params = [
            name.trim(),
            description?.trim() || null
        ];

        if (contentSchema !== undefined) {

            sql += `,
                content_schema = ?
            `;

            params.push(JSON.stringify(contentSchema));
        }

        sql += ` WHERE id = ?`;

        params.push(typeId);

        await db.query(sql, params);


        res.status(200).json({
            success: true,
            message: "Coding challenge type updated successfully"
        });

    } catch (error) {

        console.error(
            "Update Coding Challenge Type Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update coding challenge type"
        });
    }
};


module.exports = {
    updateCodingChallengeType
};