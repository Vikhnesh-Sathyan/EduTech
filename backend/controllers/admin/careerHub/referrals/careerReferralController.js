
const db = require("../../../../config/db");

// ==========================================
// GET REFERRAL OPPORTUNITIES
// ==========================================

const getCareerReferrals = async (req, res) => {

    try {

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
                u.name AS contributor_name,
                u.role AS contributor_role

             FROM career_referrals r

             JOIN career_companies c
                ON r.company_id = c.id

             JOIN career_job_roles jr
                ON r.job_role_id = jr.id

             JOIN career_countries co
                ON r.country_id = co.id

             JOIN users u
                ON r.created_by = u.id

             ORDER BY r.created_at DESC`
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


// ==========================================
// ARCHIVE REFERRAL OPPORTUNITY
// ==========================================

const archiveCareerReferral = async (req, res) => {

    try {

        const { referralId } = req.params;

        const [result] = await db.execute(
            `UPDATE career_referrals
             SET status = 'archived'
             WHERE id = ?
             AND status = 'published'`,
            [referralId]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Referral opportunity not found or already archived"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Referral opportunity archived successfully"
        });

    } catch (error) {

        console.error("Archive career referral error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to archive referral opportunity"
        });
    }
};


module.exports = {
    getCareerReferrals,
    archiveCareerReferral
};
