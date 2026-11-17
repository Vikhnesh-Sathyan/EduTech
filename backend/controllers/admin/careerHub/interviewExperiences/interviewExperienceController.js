
const db = require("../../../../config/db");

// ==========================================
// GET ALL INTERVIEW EXPERIENCES
// ==========================================

const getInterviewExperiences = async (req, res) => {

    try {

        const sql = `
            SELECT
                ie.id,

                ie.company_id,
                cc.company_name,

                ie.job_role_id,
                jr.role_name,

                ie.country_id,
                co.country_name,

                ie.experience_level,
                ie.questions_text,

                ie.created_by,
                creator.name AS contributor_name,
                creator.role AS contributor_role,

                ie.status,
                ie.created_at

            FROM career_interview_experiences ie

            INNER JOIN career_companies cc
                ON cc.id = ie.company_id

            INNER JOIN career_job_roles jr
                ON jr.id = ie.job_role_id

            INNER JOIN career_countries co
                ON co.id = ie.country_id

            INNER JOIN users creator
                ON creator.id = ie.created_by

            ORDER BY ie.created_at DESC
        `;

        const [experiences] = await db.execute(sql);

        return res.status(200).json({
            success: true,
            message: "Interview experiences fetched successfully",
            data: experiences
        });

    } catch (error) {

        console.error("Get interview experiences error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch interview experiences"
        });

    }

};


// ==========================================
// ARCHIVE INTERVIEW EXPERIENCE
// ==========================================

const archiveInterviewExperience = async (req, res) => {

    try {

        const { experienceId } = req.params;

        if (
            !Number.isInteger(Number(experienceId)) ||
            Number(experienceId) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid interview experience ID"
            });

        }

        const sql = `
            UPDATE career_interview_experiences

            SET status = 'archived'

            WHERE id = ?
              AND status = 'published'
        `;

        const [result] = await db.execute(
            sql,
            [experienceId]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Published interview experience not found"
            });

        }

        return res.status(200).json({
            success: true,
            message: "Interview experience archived successfully"
        });

    } catch (error) {

        console.error("Archive interview experience error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to archive interview experience"
        });

    }

};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    getInterviewExperiences,
    archiveInterviewExperience
};
