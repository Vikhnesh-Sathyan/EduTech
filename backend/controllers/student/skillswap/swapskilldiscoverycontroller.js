
const db = require("../../../config/db");

// ==========================================
// DISCOVER STUDENTS BY SKILL
// ==========================================
const discoverStudents = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { skill_id } = req.query;

        if (
            !skill_id ||
            !Number.isInteger(Number(skill_id)) ||
            Number(skill_id) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid skill_id is required"
            });
        }

        const [students] = await db.execute(
            `SELECT
                u.id AS student_id,
                ss.skill_id,
                s.name AS skill_name,
                ss.proficiency_level
             FROM student_skills ss
             INNER JOIN skills s ON s.id = ss.skill_id
             INNER JOIN users u ON u.id = ss.student_id
             WHERE ss.skill_id = ?
               AND ss.skill_type = 'teach'
               AND s.status = 'active'
               AND ss.student_id <> ?
             ORDER BY
                CASE ss.proficiency_level
                    WHEN 'advanced' THEN 1
                    WHEN 'intermediate' THEN 2
                    WHEN 'beginner' THEN 3
                    ELSE 4
                END,
                u.id ASC`,
            [Number(skill_id), studentId]
        );

        return res.status(200).json({
            success: true,
            message: "Skill Swap students fetched successfully",
            data: students
        });
    } catch (error) {
        console.error("Discover students error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to discover students"
        });
    }
};

module.exports = {
    discoverStudents
};
