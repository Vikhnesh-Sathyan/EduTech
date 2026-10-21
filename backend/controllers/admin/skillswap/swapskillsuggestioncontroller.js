
const db = require("../../../config/db");

// ==========================================
// GET SKILL SUGGESTIONS
// ==========================================
const getSkillSuggestions = async (req, res) => {
    try {
        const { status } = req.query;

        const allowedStatuses = [
            "pending",
            "approved",
            "rejected"
        ];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid suggestion status"
            });
        }

        let query = `
            SELECT
                ss.id,
                ss.student_id,
                ss.name,
                ss.category,
                ss.description,
                ss.status,
                ss.reviewed_by,
                ss.reviewed_at,
                ss.admin_comment
            FROM skill_suggestions ss
        `;

        const params = [];

        if (status) {
            query += " WHERE ss.status = ?";
            params.push(status);
        }

        query += " ORDER BY ss.id DESC";

        const [suggestions] = await db.execute(query, params);

        return res.status(200).json({
            success: true,
            message: "Skill suggestions fetched successfully",
            data: suggestions
        });

    } catch (error) {
        console.error("Get skill suggestions error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch skill suggestions"
        });
    }
};


const reviewSkillSuggestion = async (req, res) => {
    let connection;

    try {
        const { suggestionId } = req.params;
        const { status, admin_comment } = req.body;

        if (
            !Number.isInteger(Number(suggestionId)) ||
            Number(suggestionId) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid suggestion ID"
            });
        }

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be approved or rejected"
            });
        }

        if (
            admin_comment !== undefined &&
            admin_comment !== null &&
            typeof admin_comment !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Admin comment must be a string"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Find and lock the pending suggestion
        const [suggestions] = await connection.execute(
            `SELECT id, student_id, name, category, description, status
             FROM skill_suggestions
             WHERE id = ?
             FOR UPDATE`,
            [Number(suggestionId)]
        );

        if (
            suggestions.length === 0 ||
            suggestions[0].status !== "pending"
        ) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Pending skill suggestion not found"
            });
        }

        const suggestion = suggestions[0];

        // Create a skill only when the admin approves
        if (status === "approved") {
            const [existingSkills] = await connection.execute(
                `SELECT id
                 FROM skills
                 WHERE LOWER(name) = LOWER(?)
                 LIMIT 1`,
                [suggestion.name]
            );

            if (existingSkills.length > 0) {
                await connection.rollback();

                return res.status(409).json({
                    success: false,
                    message: "This skill already exists. The suggestion remains pending."
                });
            }

            await connection.execute(
                `INSERT INTO skills
                    (name, category, description, status, created_by)
                 VALUES (?, ?, ?, 'active', ?)`,
                [
                    suggestion.name,
                    suggestion.category,
                    suggestion.description,
                    req.user.id
                ]
            );
        }

        // Save the admin's decision
        await connection.execute(
            `UPDATE skill_suggestions
             SET status = ?,
                 reviewed_by = ?,
                 reviewed_at = NOW(),
                 admin_comment = ?
             WHERE id = ?`,
            [
                status,
                req.user.id,
                admin_comment?.trim() || null,
                Number(suggestionId)
            ]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: `Skill suggestion ${status} successfully`,
            data: {
                suggestion_id: Number(suggestionId),
                status
            }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Review skill suggestion error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to review skill suggestion"
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};


const getSkillSuggestionStats = async (req, res) => {
    try {
        const [stats] = await db.execute(
            `SELECT
                COUNT(*) AS total_suggestions,
                COALESCE(SUM(status = 'pending'), 0) AS pending_count,
                COALESCE(SUM(status = 'approved'), 0) AS approved_count,
                COALESCE(SUM(status = 'rejected'), 0) AS rejected_count
            FROM skill_suggestions`
        );

        return res.status(200).json({
            success: true,
            message: "Skill suggestion statistics fetched successfully",
            data: stats[0]
        });

    } catch (error) {
        console.error("Get skill suggestion statistics error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch skill suggestion statistics"
        });
    }
};


module.exports = {
    getSkillSuggestions,
    reviewSkillSuggestion,
    getSkillSuggestionStats
};
