
const db = require("../../../../config/db");

// ==========================================
// GET JOB FORM DATA
// ==========================================

const getJobFormData = async (req, res) => {

    try {

        const companiesSql = `
            SELECT id, company_name
            FROM career_companies
            WHERE is_active = 1
            ORDER BY company_name
        `;

        const rolesSql = `
            SELECT id, role_name
            FROM career_job_roles
            WHERE is_active = 1
            ORDER BY role_name
        `;

        const countriesSql = `
            SELECT id, country_name, country_code
            FROM career_countries
            WHERE is_active = 1
            ORDER BY country_name
        `;

        const [companies] = await db.execute(companiesSql);
        const [roles] = await db.execute(rolesSql);
        const [countries] = await db.execute(countriesSql);

        return res.status(200).json({
            success: true,
            message: "Job form data fetched successfully",
            data: {
                companies,
                roles,
                countries
            }
        });

    } catch (error) {

        console.error("Mentor job form data error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load job form data"
        });

    }

};


// ==========================================
// SUBMIT MENTOR JOB
// ==========================================

const submitCareerJob = async (req, res) => {

    try {

        const {
            company_id,
            job_role_id,
            country_id,
            state,
            city,
            experience_level,
            job_link
        } = req.body;

        const mentorId = req.user.id;

        // Validate required fields

        if (
            !company_id ||
            !job_role_id ||
            !country_id ||
            !experience_level ||
            !job_link
        ) {

            return res.status(400).json({
                success: false,
                message: "Company, job role, country, experience level and job link are required"
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

        // Validate job link

        let parsedUrl;

        try {

            parsedUrl = new URL(job_link);

        } catch {

            return res.status(400).json({
                success: false,
                message: "Please provide a valid job link"
            });

        }

        if (
            !["http:", "https:"].includes(parsedUrl.protocol) ||
            job_link.length > 1000
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid job link"
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

        // Insert mentor submission as pending

        const insertSql = `
            INSERT INTO career_jobs
            (
                company_id,
                job_role_id,
                country_id,
                state,
                city,
                experience_level,
                job_link,
                created_by,
                status
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        const [result] = await db.execute(
            insertSql,
            [
                company_id,
                job_role_id,
                country_id,
                state?.trim() || null,
                city?.trim() || null,
                experience_level,
                job_link.trim(),
                mentorId
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Job submitted successfully. Waiting for admin approval.",
            data: {
                job_id: result.insertId,
                status: "pending"
            }
        });

    } catch (error) {

        console.error("Mentor job submission error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit job"
        });

    }

};


// ==========================================
// GET AVAILABLE JOBS AND OWN SUBMISSIONS
// ==========================================

const getCareerJobs = async (req, res) => {

    try {

        const mentorId = req.user.id;

        const sql = `
            SELECT
                cj.id,

                cj.company_id,
                cc.company_name,

                cj.job_role_id,
                jr.role_name,

                cj.country_id,
                co.country_name,

                cj.state,
                cj.city,

                cj.experience_level,
                cj.employment_type,
                cj.job_link,

                cj.created_by,
                creator.name AS created_by_name,

                cj.status,
                cj.created_at

            FROM career_jobs cj

            INNER JOIN career_companies cc
                ON cc.id = cj.company_id

            INNER JOIN career_job_roles jr
                ON jr.id = cj.job_role_id

            INNER JOIN career_countries co
                ON co.id = cj.country_id

            INNER JOIN users creator
                ON creator.id = cj.created_by

            WHERE
                cj.status = 'published'
                OR cj.created_by = ?

            ORDER BY cj.created_at DESC
        `;

        const [jobs] = await db.execute(
            sql,
            [mentorId]
        );

        return res.status(200).json({
            success: true,
            message: "Career jobs fetched successfully",
            data: jobs
        });

    } catch (error) {

        console.error("Get mentor career jobs error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch career jobs"
        });

    }

};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    getJobFormData,
    submitCareerJob,
    getCareerJobs
};
