
const db = require("../../../../config/db");

// REVIEW STUDENT SUBMISSION
const reviewSubmission = async (req, res) => {
    const mentorId = req.user.id;
    const { submissionId } = req.params;
    const { mentor_feedback, star_rating } = req.body;

    // Validate feedback
    if (
        typeof mentor_feedback !== "string" ||
        !mentor_feedback.trim()
    ) {
        return res.status(400).json({
            message: "Mentor feedback is required"
        });
    }

    // Validate rating: whole number from 1 to 5
    if (
        !Number.isInteger(star_rating) ||
        star_rating < 1 ||
        star_rating > 5
    ) {
        return res.status(400).json({
            message: "Star rating must be an integer from 1 to 5"
        });
    }

    try {
        // Update only a pending submission belonging
        // to a task created by this mentor.
        const [result] = await db.query(
            `
            UPDATE code_to_logic_submissions cts
            INNER JOIN code_to_logic_tasks ctl
                ON ctl.id = cts.task_id
            SET
                cts.mentor_feedback = ?,
                cts.star_rating = ?,
                cts.review_status = 'reviewed',
                cts.reviewed_at = CURRENT_TIMESTAMP
            WHERE cts.id = ?
              AND ctl.mentor_id = ?
              AND cts.review_status = 'pending'
            `,
            [
                mentor_feedback.trim(),
                star_rating,
                submissionId,
                mentorId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Pending submission not found for your task"
            });
        }

        return res.status(200).json({
            message: "Submission reviewed successfully"
        });

    } catch (error) {
        console.error(
            "Submission review failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to review submission"
        });
    }
};

module.exports = {
    reviewSubmission
};
