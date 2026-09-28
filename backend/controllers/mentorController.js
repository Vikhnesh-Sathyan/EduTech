// Handles mentor profile creation, retrieval and updates

const db = require("../config/db");

// Get the authenticated mentor's profile
// Get the authenticated mentor's profile
const getMentorProfile = (req, res) => {

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

    db.query(
        sql,
        [req.user.id],
        (err, result) => {

            if (err) {

                console.error(
                    "Mentor profile fetch failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to load mentor profile"
                });
            }


            if (result.length === 0) {

                return res.status(404).json({
                    message: "Mentor account not found"
                });

            }


            res.status(200).json({
                profile: result[0]
            });

        }
    );
};

// Create or update the authenticated mentor's profile
const saveMentorProfile = (req, res) => {

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

    db.query(
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
        ],
        (err) => {

            if (err) {
                console.error(
                    "Mentor profile save failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to save mentor profile"
                });
            }

            res.status(200).json({
                message: "Mentor profile saved successfully"
            });
        }
    );
};


module.exports = {
    getMentorProfile,
    saveMentorProfile
};