
const db = require("../../../../config/db");

// CREATE CODE TO LOGIC TASK
const createTask = async (req, res) => {
    const mentorId = req.user.id;

    const {
        subject_id,
        title,
        description,
        code_content,
        status
    } = req.body;

    // Validate required fields
    if (
        !subject_id ||
        !title?.trim() ||
        !description?.trim() ||
        !code_content?.trim()
    ) {
        return res.status(400).json({
            message: "Subject, title, description and code are required"
        });
    }

    // Validate task status
    const allowedStatuses = ["draft", "published"];

    if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid task status"
        });
    }

    try {
        // Confirm that the subject exists
        const [subjects] = await db.query(
            `
            SELECT id
            FROM subjects
            WHERE id = ?
            `,
            [subject_id]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        // Create the task for the logged-in mentor
        const [result] = await db.query(
            `
            INSERT INTO code_to_logic_tasks
            (
                mentor_id,
                subject_id,
                title,
                description,
                code_content,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                mentorId,
                subject_id,
                title.trim(),
                description.trim(),
                code_content.trim(),
                status || "draft"
            ]
        );

        return res.status(201).json({
            message: "Code to Logic task created successfully",
            taskId: result.insertId
        });

    } catch (error) {
        console.error("Code to Logic task creation failed:", error);

        return res.status(500).json({
            message: "Failed to create Code to Logic task"
        });
    }
};


/**
 * GET MENTOR'S CODE TO LOGIC TASKS
 */
const getMyTasks = async (req, res) => {
    const mentorId = req.user.id;

    try {
        const [tasks] = await db.query(
            `
            SELECT
                ctl.id,
                ctl.subject_id,
                s.name AS subject_name,
                ctl.title,
                ctl.description,
                ctl.code_content,
                ctl.status,
                ctl.created_at,
                ctl.updated_at
            FROM code_to_logic_tasks ctl
            INNER JOIN subjects s
                ON s.id = ctl.subject_id
            WHERE ctl.mentor_id = ?
            ORDER BY ctl.created_at DESC
            `,
            [mentorId]
        );

        return res.status(200).json({
            tasks
        });

    } catch (error) {
        console.error(
            "Code to Logic task fetch failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load Code to Logic tasks"
        });
    }
};


const getTaskSubmissions = async (req, res) => {
    const mentorId = req.user.id;
    const { taskId } = req.params;

    try {
        // Confirm that this task belongs to the logged-in mentor.
        const [tasks] = await db.query(
            `
            SELECT id
            FROM code_to_logic_tasks
            WHERE id = ?
              AND mentor_id = ?
            `,
            [taskId, mentorId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Get submissions for this mentor's task.
        const [submissions] = await db.query(
            `
            SELECT
                cts.id AS submission_id,
                cts.student_id,
                u.name AS student_name,
                cts.explanation,
                cts.submission_number,
                cts.mentor_feedback,
                cts.star_rating,
                cts.review_status,
                cts.submitted_at,
                cts.reviewed_at
            FROM code_to_logic_submissions cts
            INNER JOIN users u
                ON u.id = cts.student_id
            WHERE cts.task_id = ?
              AND u.role = 'student'
            ORDER BY cts.submitted_at DESC
            `,
            [taskId]
        );

        return res.status(200).json({
            submissions
        });

    } catch (error) {
        console.error(
            "Task submissions fetch failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load task submissions"
        });
    }
};


module.exports = {
    createTask,
    getMyTasks,
    getTaskSubmissions
};
