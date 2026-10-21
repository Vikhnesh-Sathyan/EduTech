
const db = require("../../../config/db");

// ==========================================
// SAVE STUDENT SKILLS
// ==========================================
const saveStudentSkills = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const studentId = req.user.id;
        const { skills } = req.body;

        if (!Array.isArray(skills)) {
            return res.status(400).json({
                success: false,
                message: "Skills must be an array"
            });
        }

        const validTypes = ["teach", "learn"];
        const validLevels = [
            "beginner",
            "intermediate",
            "advanced"
        ];

        for (const skill of skills) {
            if (
                !Number.isInteger(Number(skill.skill_id)) ||
                Number(skill.skill_id) <= 0 ||
                !validTypes.includes(skill.skill_type) ||
                (
                    skill.proficiency_level != null &&
                    !validLevels.includes(skill.proficiency_level)
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "One or more skill details are invalid"
                });
            }
        }

        const uniqueSkills = new Set(
            skills.map(
                skill => `${skill.skill_id}-${skill.skill_type}`
            )
        );

        if (uniqueSkills.size !== skills.length) {
            return res.status(400).json({
                success: false,
                message: "Duplicate skill selections are not allowed"
            });
        }

        await connection.beginTransaction();

        for (const skill of skills) {
            const [activeSkills] = await connection.execute(
                `SELECT id
                 FROM skills
                 WHERE id = ? AND status = 'active'`,
                [Number(skill.skill_id)]
            );

            if (activeSkills.length === 0) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: `Skill ID ${skill.skill_id} is not available`
                });
            }

            await connection.execute(
                `INSERT INTO student_skills
                    (student_id, skill_id, skill_type, proficiency_level)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    proficiency_level = VALUES(proficiency_level)`,
                [
                    studentId,
                    Number(skill.skill_id),
                    skill.skill_type,
                    skill.proficiency_level || null
                ]
            );
        }

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Student skills saved successfully"
        });
    } catch (error) {
        await connection.rollback();

        console.error("Save student skills error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save student skills"
        });
    } finally {
        connection.release();
    }
};


 // ==========================================
// GET MY SKILLS (STUDENT)
// ==========================================
const getMySkills = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [skills] = await db.execute(
            `SELECT
                ss.id,
                ss.skill_id,
                s.name,
                s.category,
                ss.skill_type,
                ss.proficiency_level
             FROM student_skills ss
             INNER JOIN skills s ON s.id = ss.skill_id
             WHERE ss.student_id = ?
             ORDER BY ss.skill_type ASC, s.name ASC`,
            [studentId]
        );

        return res.status(200).json({
            success: true,
            message: "Your skills fetched successfully",
            data: skills
        });
    } catch (error) {
        console.error("Fetch student skills error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch your skills"
        });
    }
};


const removeMySkill = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { skillId } = req.params;
        const { skill_type } = req.body;

        // Validate skill ID
        if (!Number.isInteger(Number(skillId)) || Number(skillId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID"
            });
        }

        // Validate skill type
        if (!["teach", "learn"].includes(skill_type)) {
            return res.status(400).json({
                success: false,
                message: "Skill type must be teach or learn"
            });
        }

        // Remove only the logged-in student's own skill
        const [result] = await db.execute(
            `DELETE FROM student_skills
             WHERE student_id = ?
               AND skill_id = ?
               AND skill_type = ?`,
            [studentId, Number(skillId), skill_type]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Skill not found in your profile"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Skill removed from your profile successfully"
        });

    } catch (error) {
        console.error("Remove student skill error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove skill from your profile"
        });
    }
};


module.exports = {
    saveStudentSkills,
    getMySkills,
    removeMySkill
};
