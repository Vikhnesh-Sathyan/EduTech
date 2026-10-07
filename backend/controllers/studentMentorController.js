const db = require("../config/db");

// =====================================================
// GET AVAILABLE MENTORS
// =====================================================

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

// =====================================================
// GET MENTOR PROFILE
// =====================================================

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

// =====================================================
// GET MY MENTOR
// =====================================================

// Gets the student's currently connected mentor
const getMyMentor = async (req, res) => {


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

            msr.status,
            msr.created_at AS connected_at

        FROM mentor_student_relationships msr

        INNER JOIN users u
            ON u.id = msr.mentor_id

        INNER JOIN mentor_profiles mp
            ON mp.user_id = msr.mentor_id

        WHERE msr.student_id = ?
          AND msr.status = 'accepted'
          AND msr.is_active = TRUE
          AND u.role = 'mentor'
          AND u.status = 'active'
          AND mp.verification_status = 'approved'
        `,
        [studentId]
    );

    if (mentors.length === 0) {

        return res.status(200).json({
            mentor: null
        });

    }

    return res.status(200).json({
        mentor: mentors[0]
    });

} catch (error) {

    console.error(
        "My mentor fetch failed:",
        error
    );

    return res.status(500).json({
        message: "Failed to load current mentor"
    });

}


};

// =====================================================
// GET PREVIOUS MENTORS
// =====================================================

// Gets mentors who were previously connected to the student
const getPreviousMentors = async (req, res) => {


const studentId = req.user.id;

try {

    const [mentors] = await db.query(
        `
        SELECT
            u.id AS mentor_id,
            u.name,
            mp.specialization,
            mp.skills

        FROM mentor_student_relationships msr

        INNER JOIN users u
            ON u.id = msr.mentor_id

        INNER JOIN mentor_profiles mp
            ON mp.user_id = msr.mentor_id

        WHERE msr.student_id = ?
          AND msr.status = 'accepted'
          AND msr.is_active = FALSE

        ORDER BY msr.updated_at DESC
        `,
        [studentId]
    );

    return res.status(200).json({
        mentors
    });

} catch (error) {

    console.error(
        "Previous mentors fetch failed:",
        error
    );

    return res.status(500).json({
        message: "Failed to load previous mentors"
    });

}


};

// =====================================================
// GET MENTOR RECOMMENDATIONS
// =====================================================

// Gets mentors recommended for the current student
const getMentorRecommendations = async (req, res) => {


const studentId = req.user.id;

try {

    // Get the student's career goal
    const [students] = await db.query(
        `
        SELECT
            career_goal
        FROM student_profiles
        WHERE user_id = ?
        `,
        [studentId]
    );

    if (students.length === 0) {

        return res.status(200).json({
            mentors: []
        });

    }

    const student = students[0];

    // Get approved mentors excluding the student's
    // currently connected mentor
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

          -- Do not recommend the student's current mentor again
          AND u.id NOT IN (
              SELECT mentor_id
              FROM mentor_student_relationships
              WHERE student_id = ?
                AND status = 'accepted'
          )

        ORDER BY

            -- Exact specialization match first
            CASE
                WHEN LOWER(mp.specialization)
                     = LOWER(?) THEN 0

                -- Partial specialization match second
                WHEN LOWER(mp.specialization)
                     LIKE LOWER(CONCAT('%', ?, '%'))
                THEN 1

                -- Other approved mentors after matches
                ELSE 2
            END,

            u.name ASC
        `,
        [
            studentId,
            studentId,
            student.career_goal || '',
            student.career_goal || ''
        ]
    );

    return res.status(200).json({
        mentors
    });

} catch (error) {

    console.error(
        "Mentor recommendations fetch failed:",
        error
    );

    return res.status(500).json({
        message: "Failed to load mentor recommendations"
    });

}


};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
getAvailableMentors,
getMentorProfile,
getMyMentor,
getPreviousMentors,
getMentorRecommendations
};
