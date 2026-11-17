
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

        console.error("Get job form data error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load job form data"
        });

    }

};


// ==========================================
// CREATE AND PUBLISH ADMIN JOB
// ==========================================

const createCareerJob = async (req, res) => {

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

        const adminId = req.user.id;

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

        // Verify active company, role and country

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

        // Insert admin job directly as published

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

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published')
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
                adminId
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Job published successfully",
            data: {
                job_id: result.insertId
            }
        });

    } catch (error) {

        console.error("Create career job error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create job"
        });

    }

};


// ==========================================
// GET ALL CAREER JOBS
// ==========================================

const getCareerJobs = async (req, res) => {

    try {

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

                cj.reviewed_by,
                reviewer.name AS reviewed_by_name,

                cj.reviewed_at,
                cj.created_at,
                cj.updated_at

            FROM career_jobs cj

            INNER JOIN career_companies cc
                ON cc.id = cj.company_id

            INNER JOIN career_job_roles jr
                ON jr.id = cj.job_role_id

            INNER JOIN career_countries co
                ON co.id = cj.country_id

            INNER JOIN users creator
                ON creator.id = cj.created_by

            LEFT JOIN users reviewer
                ON reviewer.id = cj.reviewed_by

            ORDER BY cj.created_at DESC
        `;

        const [jobs] = await db.execute(sql);

        return res.status(200).json({
            success: true,
            message: "Career jobs fetched successfully",
            data: jobs
        });

    } catch (error) {

        console.error("Get career jobs error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch career jobs"
        });

    }

};


// ==========================================
// APPROVE CAREER JOB
// ==========================================

const approveCareerJob = async (req, res) => {

    try {

        const { jobId } = req.params;
        const adminId = req.user.id;

        if (
            !Number.isInteger(Number(jobId)) ||
            Number(jobId) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid job ID"
            });

        }

        const sql = `
            UPDATE career_jobs

            SET
                status = 'published',
                reviewed_by = ?,
                reviewed_at = CURRENT_TIMESTAMP

            WHERE id = ?
              AND status = 'pending'
        `;

        const [result] = await db.execute(
            sql,
            [
                adminId,
                jobId
            ]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Pending job not found"
            });

        }

        return res.status(200).json({
            success: true,
            message: "Job approved and published successfully"
        });

    } catch (error) {

        console.error("Approve career job error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to approve job"
        });

    }

};


// ==========================================
// REJECT CAREER JOB
// ==========================================

const rejectCareerJob = async (req, res) => {

    try {

        const { jobId } = req.params;
        const adminId = req.user.id;

        if (
            !Number.isInteger(Number(jobId)) ||
            Number(jobId) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid job ID"
            });

        }

        const sql = `
            UPDATE career_jobs

            SET
                status = 'rejected',
                reviewed_by = ?,
                reviewed_at = CURRENT_TIMESTAMP

            WHERE id = ?
              AND status = 'pending'
        `;

        const [result] = await db.execute(
            sql,
            [
                adminId,
                jobId
            ]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Pending job not found"
            });

        }

        return res.status(200).json({
            success: true,
            message: "Job rejected successfully"
        });

    } catch (error) {

        console.error("Reject career job error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reject job"
        });

    }

};


// ==========================================
// ARCHIVE CAREER JOB
// ==========================================

const archiveCareerJob = async (req, res) => {

    try {

        const { jobId } = req.params;

        if (
            !Number.isInteger(Number(jobId)) ||
            Number(jobId) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid job ID"
            });

        }

        const sql = `
            UPDATE career_jobs

            SET status = 'archived'

            WHERE id = ?
              AND status = 'published'
        `;

        const [result] = await db.execute(
            sql,
            [jobId]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Published job not found"
            });

        }

        return res.status(200).json({
            success: true,
            message: "Job archived successfully"
        });

    } catch (error) {

        console.error("Archive career job error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to archive job"
        });

    }

};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    getJobFormData,
    createCareerJob,
    getCareerJobs,
    approveCareerJob,
    rejectCareerJob,
    archiveCareerJob
};
