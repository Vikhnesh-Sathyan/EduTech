// Handles mentor profile creation, retrieval and updates

const db = require("../../config/db");


// ==========================================
// GET MENTOR PROFILE
// ==========================================

const getMentorProfile = async (req, res) => {

    const sql = `
        SELECT
            mp.id,
            u.name,
            u.email,
            mp.professional_title,
            mp.specialization,
            mp.bio,
            mp.experience_years,
            mp.skills,
            mp.linkedin_url,
            mp.github_url,
            mp.availability_days,
            mp.availability_start_time,
            mp.availability_end_time,
            mp.verification_status,
            mp.verification_note
        FROM users u
        LEFT JOIN mentor_profiles mp
            ON mp.user_id = u.id
        WHERE u.id = ?
    `;

    try {

        const [result] = await db.query(
            sql,
            [req.user.id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                message: "Mentor account not found"
            });
        }

        res.status(200).json({
            profile: result[0]
        });

    } catch (err) {

        console.error(
            "Mentor profile fetch failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to load mentor profile"
        });
    }
};


// ==========================================
// CREATE OR UPDATE MENTOR PROFILE
// ==========================================

const saveMentorProfile = async (req, res) => {

    const {
        professional_title,
        specialization,
        bio,
        experience_years,
        skills,
        linkedin_url,
        github_url,
        availability_days,
        availability_start_time,
        availability_end_time
    } = req.body;

    if (!professional_title || !specialization) {
        return res.status(400).json({
            message:
                "Professional title and specialization are required"
        });
    }

    const sql = `
        INSERT INTO mentor_profiles
        (
            user_id,
            professional_title,
            specialization,
            bio,
            experience_years,
            skills,
            linkedin_url,
            github_url,
            availability_days,
            availability_start_time,
            availability_end_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE
            professional_title = VALUES(professional_title),
            specialization = VALUES(specialization),
            bio = VALUES(bio),
            experience_years = VALUES(experience_years),
            skills = VALUES(skills),
            linkedin_url = VALUES(linkedin_url),
            github_url = VALUES(github_url),
            availability_days = VALUES(availability_days),
            availability_start_time = VALUES(availability_start_time),
            availability_end_time = VALUES(availability_end_time)
    `;

    try {

        await db.query(
            sql,
            [
                req.user.id,
                professional_title,
                specialization,
                bio || null,
                experience_years || null,
                skills || null,
                linkedin_url || null,
                github_url || null,
                availability_days || null,
                availability_start_time || null,
                availability_end_time || null
            ]
        );

        res.status(200).json({
            message: "Mentor profile saved successfully"
        });

    } catch (err) {

        console.error(
            "Mentor profile save failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to save mentor profile"
        });
    }
};


// ==========================================
// SUBMIT FOR VERIFICATION
// ==========================================

const submitForVerification = async (req, res) => {

    const userId = req.user.id;

    // ==========================================
    // GET MENTOR PROFILE
    // ==========================================

    const selectSql = `
        SELECT
            professional_title,
            specialization,
            bio,
            experience_years,
            skills,
            availability_days,
            availability_start_time,
            availability_end_time
        FROM mentor_profiles
        WHERE user_id = ?
    `;

    try {

        const [result] = await db.query(
            selectSql,
            [userId]
        );

        // ==========================================
        // PROFILE NOT FOUND
        // ==========================================

        if (result.length === 0) {
            return res.status(400).json({
                message:
                    "Please complete your mentor profile first"
            });
        }

        const profile = result[0];

        // ==========================================
        // FIND INCOMPLETE FIELDS
        // ==========================================

        const missingFields = [];

        if (!profile.professional_title?.trim()) {
            missingFields.push("Professional Title");
        }

        if (!profile.specialization?.trim()) {
            missingFields.push("Specialization");
        }

        if (!profile.bio?.trim()) {
            missingFields.push("Professional Bio");
        }

        if (!profile.skills?.trim()) {
            missingFields.push("Skills");
        }

        if (
            profile.experience_years === null ||
            profile.experience_years === undefined
        ) {
            missingFields.push("Experience");
        }

        if (!profile.availability_days?.trim()) {
            missingFields.push("Available Days");
        }

        if (!profile.availability_start_time) {
            missingFields.push("Start Time");
        }

        if (!profile.availability_end_time) {
            missingFields.push("End Time");
        }

        // ==========================================
        // STOP IF PROFILE IS INCOMPLETE
        // ==========================================

        if (missingFields.length > 0) {
            return res.status(400).json({
                message:
                    `Please complete: ${missingFields.join(", ")}.`
            });
        }

        // ==========================================
        // SUBMIT FOR VERIFICATION
        // ==========================================

        const updateSql = `
            UPDATE mentor_profiles
            SET
                verification_status = 'pending',
                verification_note = NULL
            WHERE user_id = ?
        `;

        const [updateResult] = await db.query(
            updateSql,
            [userId]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                message: "Mentor profile not found"
            });
        }

        res.status(200).json({
            message: "Profile submitted for verification"
        });

    } catch (err) {

        console.error(
            "Mentor verification submission failed:",
            err.message
        );

        return res.status(500).json({
            message:
                "Failed to submit profile for verification"
        });
    }
};


module.exports = {
    getMentorProfile,
    saveMentorProfile,
    submitForVerification
};
