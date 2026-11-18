
const db = require("../../../../config/db");

// ==========================================
// GET JOB FORM DATA
// ==========================================

const getJobFormData = async (req, res) => {

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
            message: "Job form data fetched successfully",
            data: {
                companies,
                roles,
                countries
            }
        });

    } catch (error) {

        console.error("Student job form data error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load job form data"
        });

    }

};


// ==========================================
// SUBMIT STUDENT JOB
// ==========================================

const submitCareerJob = async (req, res) => {
    try {
        const {
            company_id,
            company_name,
            job_role_id,
            country_id,
            state,
            city,
            experience_level,
            job_link
        } = req.body;

        const studentId = req.user.id;

        // ==========================================
        // VALIDATE COMPANY SELECTION
        // ==========================================

        const selectedCompanyId =
            company_id === null || company_id === undefined || company_id === ''
                ? null
                : Number(company_id);

        const enteredCompanyName =
            typeof company_name === "string"
                ? company_name.trim()
                : "";

        // Exactly one company option is required

        if (
            (selectedCompanyId !== null && enteredCompanyName) ||
            (selectedCompanyId === null && !enteredCompanyName)
        ) {
            return res.status(400).json({
                success: false,
                message: "Select an existing company or enter a new company name"
            });
        }

        // Validate existing company ID

        if (
            selectedCompanyId !== null &&
            (!Number.isInteger(selectedCompanyId) || selectedCompanyId <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid company selection"
            });
        }

        // Validate manually entered company name

        if (
            selectedCompanyId === null &&
            (
                enteredCompanyName.length === 0 ||
                enteredCompanyName.length > 150
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Company name is required and must not exceed 150 characters"
            });
        }

        // ==========================================
        // VALIDATE REQUIRED FIELDS
        // ==========================================

        if (
            !job_role_id ||
            !country_id ||
            !experience_level ||
            !job_link
        ) {
            return res.status(400).json({
                success: false,
                message: "Job role, country, experience level and job link are required"
            });
        }

        const ids = [job_role_id, country_id];

        if (
            !ids.every(id =>
                Number.isInteger(Number(id)) &&
                Number(id) > 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid job role or country"
            });
        }

        const roleId = Number(job_role_id);
        const countryId = Number(country_id);

        // ==========================================
        // VALIDATE EXPERIENCE LEVEL
        // ==========================================

        if (!["fresher", "experienced"].includes(experience_level)) {
            return res.status(400).json({
                success: false,
                message: "Invalid experience level"
            });
        }

        // ==========================================
        // VALIDATE JOB LINK
        // ==========================================

        if (
            typeof job_link !== "string" ||
            job_link.trim().length === 0 ||
            job_link.trim().length > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid job link"
            });
        }

        let parsedUrl;

        try {
            parsedUrl = new URL(job_link.trim());
        } catch {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid job link"
            });
        }

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return res.status(400).json({
                success: false,
                message: "Only HTTP and HTTPS job links are allowed"
            });
        }

        // ==========================================
        // VALIDATE OPTIONAL LOCATION FIELDS
        // ==========================================

        if (
            (state != null && typeof state !== "string") ||
            (city != null && typeof city !== "string")
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid state or city"
            });
        }


        // ==========================================
        // CHECK FOR DUPLICATE COMPANY NAME
        // ==========================================

        if (selectedCompanyId === null) {

            const [existingCompanies] = await db.execute(
                `
                    SELECT id, company_name, is_active
                    FROM career_companies
                    WHERE LOWER(TRIM(company_name)) = LOWER(?)
                    LIMIT 1
                `,
                [enteredCompanyName]
            );

            if (existingCompanies.length > 0) {

                const existingCompany = existingCompanies[0];

                if (existingCompany.is_active) {
                    return res.status(409).json({
                        success: false,
                        message: "This company already exists. Please select it from the company dropdown."
                    });
                }

                return res.status(409).json({
                    success: false,
                    message: "This company already exists but is currently inactive. Please contact the admin."
                });

            }

        }


        // ==========================================
        // VALIDATE ACTIVE MASTER RECORDS
        // ==========================================

        const validationSql = `
            SELECT
                c.id AS company_id,
                jr.id AS job_role_id,
                co.id AS country_id

            FROM career_job_roles jr

            CROSS JOIN career_countries co

            LEFT JOIN career_companies c
                ON c.id = ?
                AND c.is_active = 1

            WHERE jr.id = ?
              AND jr.is_active = 1

              AND co.id = ?
              AND co.is_active = 1
        `;

        const [validRecords] = await db.execute(
            validationSql,
            [
                selectedCompanyId,
                roleId,
                countryId
            ]
        );

        if (
            validRecords.length === 0 ||
            (selectedCompanyId !== null && !validRecords[0].company_id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Selected company, job role or country is unavailable"
            });
        }

        // ==========================================
        // DETERMINE COMPANY NAME
        // ==========================================

        let finalCompanyName = enteredCompanyName;

        if (selectedCompanyId !== null) {
            const [companies] = await db.execute(
                `
                    SELECT company_name
                    FROM career_companies
                    WHERE id = ?
                      AND is_active = 1
                `,
                [selectedCompanyId]
            );

            finalCompanyName = companies[0].company_name;
        }

        // ==========================================
        // INSERT STUDENT JOB SUBMISSION
        // ==========================================

        const insertSql = `
            INSERT INTO career_jobs
            (
                company_id,
                company_name,
                job_role_id,
                country_id,
                state,
                city,
                experience_level,
                job_link,
                created_by,
                status
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        const [result] = await db.execute(
            insertSql,
            [
                selectedCompanyId,
                finalCompanyName,
                roleId,
                countryId,
                state?.trim() || null,
                city?.trim() || null,
                experience_level,
                job_link.trim(),
                studentId
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
        console.error("Student job submission error:", error);

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
        const studentId = req.user.id;

        const sql = `
            SELECT
                cj.id,

                cj.company_id,
                COALESCE(cj.company_name, cc.company_name) AS company_name,

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

            LEFT JOIN career_companies cc
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
            [studentId]
        );

        return res.status(200).json({
            success: true,
            message: "Career jobs fetched successfully",
            data: jobs
        });

    } catch (error) {
        console.error("Get student career jobs error:", error);

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
