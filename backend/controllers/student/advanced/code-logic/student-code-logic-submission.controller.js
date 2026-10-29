const db = require("../../../../config/db");

const submitExplanation = async (req, res) => {
    const studentId = req.user.id;
    const { taskId } = req.params;
    const { explanation } = req.body;

    const parsedTaskId = Number(taskId);

if (!Number.isInteger(parsedTaskId) || parsedTaskId <= 0) {
    return res.status(400).json({
        message: "Invalid task ID"
    });
}

    if (!explanation || !explanation.trim()) {
        return res.status(400).json({
            message: "Explanation is required"
        });
    }

    try {
        // Check that the task is published and belongs to
        // the student's accepted, active mentor.
        const [tasks] = await db.query(
            `
            SELECT ctl.id
            FROM code_to_logic_tasks ctl
            INNER JOIN mentor_student_relationships msr
                ON msr.mentor_id = ctl.mentor_id
            WHERE ctl.id = ?
              AND ctl.status = 'published'
              AND msr.student_id = ?
              AND msr.status = 'accepted'
              AND msr.is_active = TRUE
            `,
            [parsedTaskId, studentId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                message: "Task not found or unavailable"
            });
        }

        // Prevent another submission while one is awaiting review.
        const [pending] = await db.query(
            `
            SELECT id
            FROM code_to_logic_submissions
            WHERE task_id = ?
              AND student_id = ?
              AND review_status = 'pending'
            LIMIT 1
            `,
            [taskId, studentId]
        );

        if (pending.length > 0) {
            return res.status(409).json({
                message: "Your previous submission is awaiting mentor review"
            });
        }

        // Calculate the next submission number.
        const [previous] = await db.query(
            `
            SELECT COALESCE(MAX(submission_number), 0) AS last_number
            FROM code_to_logic_submissions
            WHERE task_id = ?
              AND student_id = ?
            `,
            [taskId, studentId]
        );

        const submissionNumber = previous[0].last_number + 1;

        // Save this explanation as a new history record.
        await db.query(
            `
            INSERT INTO code_to_logic_submissions
            (
                task_id,
                student_id,
                explanation,
                submission_number,
                review_status
            )
            VALUES (?, ?, ?, ?, 'pending')
            `,
            [
                taskId,
                studentId,
                explanation.trim(),
                submissionNumber
            ]
        );

        return res.status(201).json({
            message: "Explanation submitted successfully",
            submissionNumber
        });

    } catch (error) {
        console.error(
            "Code to Logic explanation submission failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to submit explanation"
        });
    }
};



const getMySubmissions = async (req, res) => {
    const studentId = req.user.id;

    try {
        const [submissions] = await db.query(
            `
            SELECT
                sub.id,
                sub.task_id,
                task.title AS task_title,
                subject.name AS subject_name,
                sub.explanation,
                sub.submission_number,
                sub.review_status,
                sub.submitted_at,
                sub.reviewed_at,

                CASE
                    WHEN sub.review_status = 'reviewed'
                    THEN sub.mentor_feedback
                    ELSE NULL
                END AS mentor_feedback,

                CASE
                    WHEN sub.review_status = 'reviewed'
                    THEN sub.star_rating
                    ELSE NULL
                END AS star_rating

            FROM code_to_logic_submissions sub

            INNER JOIN code_to_logic_tasks task
                ON task.id = sub.task_id

            INNER JOIN subjects subject
                ON subject.id = task.subject_id

            WHERE sub.student_id = ?

            ORDER BY sub.submitted_at DESC, sub.id DESC
            `,
            [studentId]
        );

        return res.status(200).json({
            submissions
        });

    } catch (error) {
        console.error(
            "Student Code to Logic submissions fetch failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load submission history"
        });
    }
};




module.exports = {
    submitExplanation,
    getMySubmissions
};