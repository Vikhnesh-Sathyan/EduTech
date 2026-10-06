// Handles mentor discovery for students
// return only active + approved mentors and safe profile information.

const db = require("../config/db");



// Gets approved mentors and the current student's relationship status
const getAvailableMentors = async (req, res) => {

    const studentId = req.user.id;

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
                mp.availability_end_time,

                COALESCE(
                    msr.status,
                    'none'
                ) AS relationship_status

            FROM users u

            INNER JOIN mentor_profiles mp
                ON mp.user_id = u.id

            LEFT JOIN mentor_student_relationships msr
                ON msr.mentor_id = u.id
                AND msr.student_id = ?

            WHERE u.role = 'mentor'
              AND u.status = 'active'
              AND mp.verification_status = 'approved'

            ORDER BY u.name ASC
            `,
            [studentId]
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
    const studentId = req.user.id;

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
                mp.availability_end_time,

                COALESCE(
                    msr.status,
                    'none'
                ) AS relationship_status

            FROM users u

            INNER JOIN mentor_profiles mp
                ON mp.user_id = u.id

            LEFT JOIN mentor_student_relationships msr
                ON msr.mentor_id = u.id
                AND msr.student_id = ?

            WHERE u.id = ?
              AND u.role = 'mentor'
              AND u.status = 'active'
              AND mp.verification_status = 'approved'
            `,
            [studentId, mentorId]
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