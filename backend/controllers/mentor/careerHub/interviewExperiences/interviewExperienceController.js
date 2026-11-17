
const db = require("../../../../config/db");

// ==========================================
// GET INTERVIEW EXPERIENCE FORM DATA
// ==========================================

const getFormData = async (req, res) => {

    try {

        const [companies] = await db.execute(`
            SELECT id, company_name
            FROM career_companies
            WHERE is_active = 1
            ORDER BY company_name
        `);

        const [roles] = await db.execute(`
            SELECT id, role_name
            FROM career_job_roles
            WHERE is_active = 1
            ORDER BY role_name
        `);

        const [countries] = await db.execute(`
            SELECT id, country_name, country_code
            FROM career_countries
            WHERE is_active = 1
            ORDER BY country_name
        `);

        return res.status(200).json({
            success: true,
            message: "Interview experience form data fetched successfully",
            data: {
                companies,
                roles,
                countries
            }
        });

    } catch (error) {

        console.error("Mentor interview form data error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load form data"
        });

    }

};


// ==========================================
// SUBMIT INTERVIEW EXPERIENCE
// ==========================================

const submitInterviewExperience = async (req, res) => {

    try {

        const {
            company_id,
            job_role_id,
            country_id,
            experience_level,
            questions_text
        } = req.body;

        const mentorId = req.user.id;

        // Validate required fields

        if (
            !company_id ||
            !job_role_id ||
            !country_id ||
            !experience_level ||
            !questions_text
        ) {

            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });

        }

        // Validate IDs

        const ids = [
            company_id,
            job_role_id,
            country_id
        ];

        if (
            !ids.every(id =>
                Number.isInteger(Number(id)) &&
                Number(id) > 0
            )
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid company, job role or country"
            });

        }

        // Validate experience level

        if (!["fresher", "experienced"].includes(experience_level)) {

            return res.status(400).json({
                success: false,
                message: "Invalid experience level"
            });

        }

        // Validate interview questions

        if (
            typeof questions_text !== "string" ||
            !questions_text.trim() ||
            questions_text.trim().length > 10000
        ) {

            return res.status(400).json({
                success: false,
                message: "Interview questions are required and must be within 10000 characters"
            });

        }

        // Verify active master records

        const validationSql = `
            SELECT
                c.id AS company_id,
                jr.id AS job_role_id,
                co.id AS country_id

            FROM career_companies c

            CROSS JOIN career_job_roles jr
            CROSS JOIN career_countries co

            WHERE c.id = ?
              AND c.is_active = 1

              AND jr.id = ?
              AND jr.is_active = 1

              AND co.id = ?
              AND co.is_active = 1
        `;

        const [validRecords] = await db.execute(
            validationSql,
            [
                company_id,
                job_role_id,
                country_id
            ]
        );

        if (validRecords.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Selected company, job role or country is unavailable"
            });

        }

        // Insert and publish immediately

        const insertSql = `
            INSERT INTO career_interview_experiences
            (
                company_id,
                job_role_id,
                country_id,
                experience_level,
                questions_text,
                created_by,
                status
            )

            VALUES (?, ?, ?, ?, ?, ?, 'published')
        `;

        const [result] = await db.execute(
            insertSql,
            [
                company_id,
                job_role_id,
                country_id,
                experience_level,
                questions_text.trim(),
                mentorId
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Interview experience published successfully",
            data: {
                experience_id: result.insertId,
                status: "published"
            }
        });

    } catch (error) {

        console.error("Mentor interview submission error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit interview experience"
        });

    }

};


// ==========================================
// GET INTERVIEW EXPERIENCES
// ==========================================

const getInterviewExperiences = async (req, res) => {

    try {

        const mentorId = req.user.id;

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

            WHERE
                ie.status = 'published'
                OR ie.created_by = ?

            ORDER BY ie.created_at DESC
        `;

        const [experiences] = await db.execute(
            sql,
            [mentorId]
        );

        return res.status(200).json({
            success: true,
            message: "Interview experiences fetched successfully",
            data: experiences
        });

    } catch (error) {

        console.error("Get mentor interview experiences error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch interview experiences"
        });

    }

};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    getFormData,
    submitInterviewExperience,
    getInterviewExperiences
};
