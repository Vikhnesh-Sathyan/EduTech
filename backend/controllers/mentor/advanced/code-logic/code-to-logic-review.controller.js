
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


// GET SUBMISSIONS FOR A TASK
const getTaskSubmissions = async (req, res) => {
    const mentorId = req.user.id;
    const taskId = Number(req.params.taskId);

    if (!Number.isInteger(taskId) || taskId <= 0) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    try {
        // Confirm that this task belongs to the logged-in mentor.
        const [tasks] = await db.query(
            `
            SELECT id, title
            FROM code_to_logic_tasks
            WHERE id = ?
              AND mentor_id = ?
            LIMIT 1
            `,
            [taskId, mentorId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Retrieve every submission, including resubmissions.
        const [submissions] = await db.query(
            `
            SELECT
                s.id,
                s.task_id,
                s.student_id,
                s.explanation,
                s.submission_number,
                s.mentor_feedback,
                s.star_rating,
                s.review_status,
                s.submitted_at,
                s.reviewed_at
            FROM code_to_logic_submissions AS s
            WHERE s.task_id = ?
            ORDER BY s.student_id ASC,
                     s.submission_number DESC
            `,
            [taskId]
        );

        return res.status(200).json({
            task: tasks[0],
            submissions
        });

    } catch (error) {
        console.error("Get Code to Logic submissions error:", error);

        return res.status(500).json({
            message: "Failed to load submissions"
        });
    }
};


module.exports = {
    reviewSubmission,
    getTaskSubmissions
};
