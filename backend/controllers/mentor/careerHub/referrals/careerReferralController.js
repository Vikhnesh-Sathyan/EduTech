
const db = require("../../../../config/db");

// ==========================================
// GET REFERRAL FORM DATA
// ==========================================

const getReferralFormData = async (req, res) => {

    try {

        const [companies] = await db.execute(
            `SELECT id, company_name
             FROM career_companies
             WHERE is_active = 1
             ORDER BY company_name ASC`
        );

        const [jobRoles] = await db.execute(
            `SELECT id, role_name
             FROM career_job_roles
             WHERE is_active = 1
             ORDER BY role_name ASC`
        );

        const [countries] = await db.execute(
            `SELECT id, country_name
             FROM career_countries
             WHERE is_active = 1
             ORDER BY country_name ASC`
        );

        return res.status(200).json({
            success: true,
            companies,
            jobRoles,
            countries
        });

    } catch (error) {

        console.error("Get referral form data error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load referral form data"
        });
    }
};


// ==========================================
// SUBMIT REFERRAL OPPORTUNITY
// ==========================================

const submitCareerReferral = async (req, res) => {

    try {

        const mentorId = req.user.id;

        const {
            company_id,
            job_role_id,
            country_id,
            job_link,
            referral_instructions
        } = req.body;

        if (
            !company_id ||
            !job_role_id ||
            !country_id ||
            !job_link?.trim() ||
            !referral_instructions?.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "All referral details are required"
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

        const [companies] = await db.execute(
            `SELECT id FROM career_companies
             WHERE id = ? AND is_active = 1`,
            [company_id]
        );

        const [jobRoles] = await db.execute(
            `SELECT id FROM career_job_roles
             WHERE id = ? AND is_active = 1`,
            [job_role_id]
        );

        const [countries] = await db.execute(
            `SELECT id FROM career_countries
             WHERE id = ? AND is_active = 1`,
            [country_id]
        );

        if (
            companies.length === 0 ||
            jobRoles.length === 0 ||
            countries.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid or inactive company, job role, or country"
            });
        }

        await db.execute(
            `INSERT INTO career_referrals
             (
                company_id,
                job_role_id,
                country_id,
                job_link,
                referral_instructions,
                created_by,
                status
             )
             VALUES (?, ?, ?, ?, ?, ?, 'published')`,
            [
                company_id,
                job_role_id,
                country_id,
                job_link.trim(),
                referral_instructions.trim(),
                mentorId
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Referral opportunity shared successfully"
        });

    } catch (error) {

        console.error("Submit career referral error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to share referral opportunity"
        });
    }
};


// ==========================================
// GET REFERRAL OPPORTUNITIES
// ==========================================

const getCareerReferrals = async (req, res) => {

    try {

        const mentorId = req.user.id;

        const [referrals] = await db.execute(
            `SELECT
                r.id,
                r.company_id,
                c.company_name,
                r.job_role_id,
                jr.role_name,
                r.country_id,
                co.country_name,
                r.job_link,
                r.referral_instructions,
                r.created_by,
                r.status,
                r.created_at,
                u.name AS contributor_name

             FROM career_referrals r

             JOIN career_companies c
                ON r.company_id = c.id

             JOIN career_job_roles jr
                ON r.job_role_id = jr.id

             JOIN career_countries co
                ON r.country_id = co.id

             JOIN users u
                ON r.created_by = u.id

             WHERE r.status = 'published'
                OR r.created_by = ?

             ORDER BY r.created_at DESC`,
            [mentorId]
        );

        return res.status(200).json({
            success: true,
            referrals
        });

    } catch (error) {

        console.error("Get career referrals error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch referral opportunities"
        });
    }
};


module.exports = {
    getReferralFormData,
    submitCareerReferral,
    getCareerReferrals
};
