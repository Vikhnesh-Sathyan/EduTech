const db = require("../../../../config/db");

const updateSubmissionFeedback = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const submissionId = Number(req.params.submissionId);

        const { mentor_feedback, star_rating } = req.body;

        // ---------------------------------------------
        // VALIDATE SUBMISSION ID
        // ---------------------------------------------

        if (
            !Number.isInteger(submissionId) ||
            submissionId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid submission ID"
            });
        }

        // ---------------------------------------------
        // VALIDATE FEEDBACK
        // ---------------------------------------------

        if (
            typeof mentor_feedback !== "string" ||
            !mentor_feedback.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Feedback is required"
            });
        }

        // ---------------------------------------------
        // VALIDATE STAR RATING
        // ---------------------------------------------

        if (
            !Number.isInteger(star_rating) ||
            star_rating < 1 ||
            star_rating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Star rating must be between 1 and 5"
            });
        }

        // ---------------------------------------------
        // CHECK SUBMISSION OWNERSHIP
        // ---------------------------------------------

        const [submissions] = await db.query(
            `SELECT s.id
             FROM logic_to_code_submissions s
             JOIN logic_to_code_problems p
                ON p.id = s.problem_id
             WHERE s.id = ?
               AND p.mentor_id = ?
             LIMIT 1`,
            [submissionId, mentorId]
        );

        if (submissions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        // ---------------------------------------------
        // SAVE FEEDBACK AND STAR RATING
        // ---------------------------------------------

        await db.query(
            `UPDATE logic_to_code_submissions
             SET
                mentor_feedback = ?,
                star_rating = ?,
                review_status = 'reviewed',
                reviewed_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                mentor_feedback.trim(),
                star_rating,
                submissionId
            ]
        );

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Mentor feedback and rating saved successfully"
        });

    } catch (error) {
        console.error("Submission Feedback Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save mentor feedback"
        });
    }
};

module.exports = {
    updateSubmissionFeedback
};