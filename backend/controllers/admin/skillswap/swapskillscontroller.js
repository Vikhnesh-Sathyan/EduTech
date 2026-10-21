
const db = require("../../../config/db");

// ==========================================
// ADD A NEW SKILL (ADMIN)
// ==========================================
const addSkill = async (req, res) => {
    try {
        const { name, category, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Skill name is required"
            });
        }

        const [existingSkills] = await db.execute(
            "SELECT id FROM skills WHERE name = ?",
            [name.trim()]
        );

        if (existingSkills.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This skill already exists"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO skills (name, category, description, created_by)
             VALUES (?, ?, ?, ?)`,
            [
                name.trim(),
                category?.trim() || null,
                description?.trim() || null,
                req.user.id
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Skill added successfully",
            data: {
                id: result.insertId,
                name: name.trim(),
                category: category?.trim() || null,
                description: description?.trim() || null
            }
        });
    } catch (error) {
        console.error("Add skill error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add skill"
        });
    }
};


const getAllSkills = async (req, res) => {
    try {
        const [skills] = await db.execute(
            `SELECT
                s.id,
                s.name,
                s.category,
                s.description,
                s.status,
                s.created_by
             FROM skills s
             ORDER BY s.name ASC`
        );

        return res.status(200).json({
            success: true,
            message: "Skill Swap skills fetched successfully",
            data: skills
        });

    } catch (error) {
        console.error("Get all Skill Swap skills error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch Skill Swap skills"
        });
    }
};


const updateSkill = async (req, res) => {
    try {
        const { skillId } = req.params;
        const { name, category, description } = req.body;

        if (!Number.isInteger(Number(skillId)) || Number(skillId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID"
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Skill name is required"
            });
        }

        const cleanName = name.trim();

        // Check whether another skill already uses this name
        const [existingSkills] = await db.execute(
            `SELECT id
             FROM skills
             WHERE LOWER(name) = LOWER(?)
               AND id != ?`,
            [cleanName, Number(skillId)]
        );

        if (existingSkills.length > 0) {
            return res.status(409).json({
                success: false,
                message: "A skill with this name already exists"
            });
        }

        const [result] = await db.execute(
            `UPDATE skills
             SET name = ?, category = ?, description = ?
             WHERE id = ?`,
            [
                cleanName,
                category?.trim() || null,
                description?.trim() || null,
                Number(skillId)
            ]
        );

        if (result.affectedRows === 0) {
            const [skills] = await db.execute(
                "SELECT id FROM skills WHERE id = ?",
                [Number(skillId)]
            );

            if (skills.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Skill not found"
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Skill updated successfully"
        });

    } catch (error) {
        console.error("Update Skill Swap skill error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update skill"
        });
    }
};


const updateSkillStatus = async (req, res) => {
    try {
        const { skillId } = req.params;
        const { status } = req.body;

        if (!Number.isInteger(Number(skillId)) || Number(skillId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID"
            });
        }

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive"
            });
        }

        const [result] = await db.execute(
            `UPDATE skills
             SET status = ?
             WHERE id = ?`,
            [status, Number(skillId)]
        );

        if (result.affectedRows === 0) {
            const [skills] = await db.execute(
                "SELECT id FROM skills WHERE id = ?",
                [Number(skillId)]
            );

            if (skills.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Skill not found"
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: `Skill ${status} successfully`,
            data: {
                skill_id: Number(skillId),
                status
            }
        });

    } catch (error) {
        console.error("Update Skill Swap skill status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update skill status"
        });
    }
};


module.exports = {
    addSkill,
    getAllSkills,
    updateSkill,
    updateSkillStatus
};
