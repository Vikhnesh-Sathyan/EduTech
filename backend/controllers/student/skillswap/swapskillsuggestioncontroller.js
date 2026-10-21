
const db = require("../../../config/db");

// ==========================================
// SUGGEST A NEW SKILL
// ==========================================
const suggestSkill = async (req, res) => {
    try {
        const studentId = req.user.id;

        const { name, category, description } = req.body;

        // Validate skill name
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Skill name is required"
            });
        }

        const cleanName = name.trim();

        if (cleanName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Skill name cannot exceed 100 characters"
            });
        }

        // Check whether the skill already exists
        const [existingSkills] = await db.execute(
            `SELECT id
             FROM skills
             WHERE LOWER(name) = LOWER(?)
             LIMIT 1`,
            [cleanName]
        );

        if (existingSkills.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This skill already exists in the skill directory"
            });
        }

        // Prevent duplicate pending suggestions
       // Prevent duplicate suggestions from this student
const [existingSuggestions] = await db.execute(
    `SELECT id, status
     FROM skill_suggestions
     WHERE student_id = ?
       AND LOWER(name) = LOWER(?)
     LIMIT 1`,
    [studentId, cleanName]
);

if (existingSuggestions.length > 0) {
    const previousStatus = existingSuggestions[0].status;

    return res.status(409).json({
        success: false,
        message: `You have already submitted this skill suggestion. Current status: ${previousStatus}`
    });
}

        // Save suggestion for admin review
        const [result] = await db.execute(
            `INSERT INTO skill_suggestions
                (student_id, name, category, description, status)
             VALUES (?, ?, ?, ?, 'pending')`,
            [
                studentId,
                cleanName,
                typeof category === "string" && category.trim()
                    ? category.trim()
                    : null,
                typeof description === "string" && description.trim()
                    ? description.trim()
                    : null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Skill suggestion submitted for admin review",
            data: {
                suggestion_id: result.insertId,
                name: cleanName,
                status: "pending"
            }
        });

    } catch (error) {
        console.error("Suggest Skill Swap skill error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit skill suggestion"
        });
    }
};


const getMySkillSuggestions = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [suggestions] = await db.execute(
            `SELECT
                id,
                name,
                category,
                description,
                status,
                admin_comment,
                reviewed_at,
                created_at
             FROM skill_suggestions
             WHERE student_id = ?
             ORDER BY id DESC`,
            [studentId]
        );

        return res.status(200).json({
            success: true,
            message: "Your skill suggestions fetched successfully",
            data: suggestions
        });

    } catch (error) {
        console.error("Get my skill suggestions error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch your skill suggestions"
        });
    }
};


module.exports = {
    suggestSkill,
    getMySkillSuggestions
};
