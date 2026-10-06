// Handles mentor discovery for students
// return only active + approved mentors and safe profile information.

const db = require("../config/db");


// GET APPROVED MENTORS
const getAvailableMentors = async (req, res) => {

    try {

        const [mentors] = await db.query(
            `
            SELECT
                u.id AS mentor_id,
                u.name,
                mp.professional_title,
                mp.specialization,
                mp.bio,
                mp.experience_years,
                mp.skills,
                mp.linkedin_url,
                mp.github_url,
                mp.availability_days,
                mp.availability_start_time,
                mp.availability_end_time

            FROM users u

            INNER JOIN mentor_profiles mp
                ON mp.user_id = u.id

            WHERE u.role = 'mentor'
              AND u.status = 'active'
              AND mp.verification_status = 'approved'

            ORDER BY u.name ASC
            `
        );


        return res.status(200).json({
            mentors
        });

    } catch (error) {

        console.error(
            "Available mentors fetch failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load mentors"
        });

    }
};


// Gets the public profile of an approved mentor
const getMentorProfile = async (req, res) => {

    const { mentorId } = req.params;

    try {

        const [mentors] = await db.query(
            `
            SELECT
                u.id AS mentor_id,
                u.name,

                mp.professional_title,
                mp.specialization,
                mp.bio,
                mp.experience_years,
                mp.skills,
                mp.linkedin_url,
                mp.github_url,
                mp.availability_days,
                mp.availability_start_time,
                mp.availability_end_time

            FROM users u

            INNER JOIN mentor_profiles mp
                ON mp.user_id = u.id

            WHERE u.id = ?
              AND u.role = 'mentor'
              AND u.status = 'active'
              AND mp.verification_status = 'approved'
            `,
            [mentorId]
        );

        if (mentors.length === 0) {

            return res.status(404).json({
                message: "Mentor profile not found"
            });

        }

        return res.status(200).json({
            mentor: mentors[0]
        });

    } catch (error) {

        console.error(
            "Mentor profile fetch failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load mentor profile"
        });

    }
};

module.exports = {
    getAvailableMentors,
    getMentorProfile
};