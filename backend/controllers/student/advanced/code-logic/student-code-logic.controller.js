
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

// GET ONE PUBLISHED TASK FOR THE LOGGED-IN STUDENT
const getTaskDetails = async (req, res) => {
    const studentId = req.user.id;
    const taskId = Number(req.params.taskId);

    if (!Number.isInteger(taskId) || taskId <= 0) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    try {
        const [tasks] = await db.query(
            `
            SELECT
                task.id,
                task.mentor_id,
                task.subject_id,
                subject.name AS subject_name,
                mentor.name AS mentor_name,
                task.title,
                task.description,
                task.code_content,
                task.created_at
            FROM code_to_logic_tasks task
            INNER JOIN subjects subject
                ON subject.id = task.subject_id
            INNER JOIN users mentor
                ON mentor.id = task.mentor_id
            INNER JOIN mentor_student_relationships msr
                ON msr.mentor_id = task.mentor_id
            WHERE task.id = ?
              AND task.status = 'published'
              AND msr.student_id = ?
              AND msr.status = 'accepted'
              AND msr.is_active = TRUE
              AND mentor.role = 'mentor'
              AND mentor.status = 'active'
            LIMIT 1
            `,
            [taskId, studentId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                message: "Task not found or unavailable"
            });
        }

        return res.status(200).json({
            task: tasks[0]
        });

    } catch (error) {
        console.error("Code to Logic task details fetch failed:", error);

        return res.status(500).json({
            message: "Failed to load task details"
        });
    }
};


module.exports = {
    getAvailableTasks,
    getTaskDetails
};
