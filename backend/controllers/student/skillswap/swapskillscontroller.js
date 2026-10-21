
const db = require("../../../config/db");

// ==========================================
// GET ACTIVE SKILLS (STUDENT)
// ==========================================
const getSkills = async (req, res) => {
    try {
        const [skills] = await db.execute(
            `SELECT id, name, category, description
             FROM skills
             WHERE status = 'active'
             ORDER BY name ASC`
        );

        return res.status(200).json({
            success: true,
            message: "Skills fetched successfully",
            data: skills
        });
    } catch (error) {
        console.error("Fetch skills error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch skills"
        });
    }
};


module.exports = {
    getSkills
};
