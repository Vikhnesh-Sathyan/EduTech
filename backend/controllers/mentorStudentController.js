// Handles mentor-student relationship operations
const db = require("../config/db");


// SEND MENTORSHIP REQUEST
const requestMentorship = async (req, res) => {

    const studentId = req.user.id;
    const { mentorId } = req.body;

    if (!mentorId) {
        return res.status(400).json({
            message: "Mentor ID is required"
        });
    }

    try {

        // Check whether the selected user is actually a mentor
        const [mentor] = await db.query(
            `
            SELECT id
            FROM users
            WHERE id = ?
              AND role = 'mentor'
              AND status = 'active'
            `,
            [mentorId]
        );

        if (mentor.length === 0) {
            return res.status(404).json({
                message: "Mentor not found"
            });
        }


        // Check whether a relationship already exists
        const [existing] = await db.query(
            `
            SELECT id, status
            FROM mentor_student_relationships
            WHERE mentor_id = ?
              AND student_id = ?
            `,
            [mentorId, studentId]
        );

        if (existing.length > 0) {

            return res.status(409).json({
                message: `Mentorship request already exists with status: ${existing[0].status}`
            });

        }


        // Create the mentorship request
        await db.query(
            `
            INSERT INTO mentor_student_relationships
            (
                mentor_id,
                student_id,
                status,
                requested_by
            )
            VALUES (?, ?, 'pending', 'student')
            `,
            [mentorId, studentId]
        );


        return res.status(201).json({
            message: "Mentorship request sent successfully"
        });

    } catch (error) {

        console.error(
            "Mentorship request failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to send mentorship request"
        });

    }
};


// GET MENTOR REQUESTS
const getMentorRequests = async (req, res) => {

    const mentorId = req.user.id;

    try {

        const [requests] = await db.query(
            `
            SELECT
                msr.id,
                msr.student_id,
                msr.status,
                msr.requested_by,
                msr.created_at,

                u.name,
                u.email,

                sp.highest_qualification,
                sp.department,
                sp.study_year,
                sp.career_goal,
                sp.learning_goals

            FROM mentor_student_relationships msr

            INNER JOIN users u
                ON u.id = msr.student_id

            LEFT JOIN student_profiles sp
                ON sp.user_id = msr.student_id

            WHERE msr.mentor_id = ?
              AND msr.status = 'pending'
              AND msr.requested_by = 'student'

            ORDER BY msr.created_at DESC
            `,
            [mentorId]
        );


        return res.status(200).json({
            requests
        });

    } catch (error) {

        console.error(
            "Mentor requests fetch failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load mentorship requests"
        });

    }
};


// ACCEPT MENTORSHIP REQUEST
const acceptMentorship = async (req, res) => {

    const mentorId = req.user.id;
    const { relationshipId } = req.params;

    try {

        const [result] = await db.query(
            `
            UPDATE mentor_student_relationships

            SET
                status = 'accepted'

            WHERE id = ?
              AND mentor_id = ?
              AND status = 'pending'
              AND requested_by = 'student'
            `,
            [relationshipId, mentorId]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Mentorship request not found"
            });

        }


        return res.status(200).json({
            message: "Mentorship request accepted"
        });

    } catch (error) {

        console.error(
            "Mentorship acceptance failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to accept mentorship request"
        });

    }
};


// REJECT MENTORSHIP REQUEST
const rejectMentorship = async (req, res) => {

    const mentorId = req.user.id;
    const { relationshipId } = req.params;

    try {

        const [result] = await db.query(
            `
            UPDATE mentor_student_relationships

            SET
                status = 'rejected'

            WHERE id = ?
              AND mentor_id = ?
              AND status = 'pending'
              AND requested_by = 'student'
            `,
            [relationshipId, mentorId]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Mentorship request not found"
            });

        }


        return res.status(200).json({
            message: "Mentorship request rejected"
        });

    } catch (error) {

        console.error(
            "Mentorship rejection failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to reject mentorship request"
        });

    }
};


module.exports = {
    requestMentorship,
    getMentorRequests,
    acceptMentorship,
    rejectMentorship
};
