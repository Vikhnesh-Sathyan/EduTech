
const db = require("../../../../config/db");

// GET PUBLISHED CODE TO LOGIC TASKS
// Students can view tasks only from their accepted, active mentor.
const getAvailableTasks = async (req, res) => {
    const studentId = req.user.id;

    try {
        const [tasks] = await db.query(
            `
            SELECT
                ctl.id,
                ctl.mentor_id,
                ctl.subject_id,
                s.name AS subject_name,
                u.name AS mentor_name,
                ctl.title,
                ctl.description,
                ctl.code_content,
                ctl.created_at

            FROM code_to_logic_tasks ctl

            INNER JOIN subjects s
                ON s.id = ctl.subject_id

            INNER JOIN users u
                ON u.id = ctl.mentor_id

            INNER JOIN mentor_student_relationships msr
                ON msr.mentor_id = ctl.mentor_id

            WHERE msr.student_id = ?
              AND msr.status = 'accepted'
              AND msr.is_active = TRUE
              AND ctl.status = 'published'
              AND u.role = 'mentor'
              AND u.status = 'active'

            ORDER BY ctl.created_at DESC
            `,
            [studentId]
        );

        return res.status(200).json({
            tasks
        });

    } catch (error) {
        console.error(
            "Available Code to Logic tasks fetch failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load available tasks"
        });
    }
};


const submitExplanation = async (req, res) => {
    const studentId = req.user.id;
    const { taskId } = req.params;
    const { explanation } = req.body;

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
            [taskId, studentId]
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


module.exports = {
    getAvailableTasks,
    submitExplanation
};
