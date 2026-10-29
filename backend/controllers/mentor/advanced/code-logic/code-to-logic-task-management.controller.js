
const db = require("../../../../config/db");

// VIEW ONE TASK

const getTaskById = async (req, res) => {
    const mentorId = req.user.id;
    const taskId = Number(req.params.taskId);

    if (!Number.isInteger(taskId) || taskId <= 0) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    try {
        const [tasks] = await db.query(
            `SELECT
                t.id,
                t.mentor_id,
                t.subject_id,
                s.name AS subject_name,

                ey.id AS education_year_id,
                d.id AS department_id,
                d.education_program_id AS program_id,

                t.title,
                t.description,
                t.code_content,
                t.status,
                t.created_at,
                t.updated_at

             FROM code_to_logic_tasks t

             LEFT JOIN subjects s
                ON s.id = t.subject_id

             LEFT JOIN education_years ey
                ON ey.id = s.education_year_id

             LEFT JOIN departments d
                ON d.id = ey.department_id

             WHERE t.id = ? AND t.mentor_id = ?`,
            [taskId, mentorId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json({
            task: tasks[0]
        });

    } catch (error) {
        console.error("Get Code to Logic task error:", error);

        return res.status(500).json({
            message: "Failed to fetch task"
        });
    }
};



// EDIT TASK DETAILS
const updateTask = async (req, res) => {
    const mentorId = req.user.id;
    const taskId = Number(req.params.taskId);

    const {
        subject_id,
        title,
        description,
        code_content
    } = req.body;

    if (!Number.isInteger(taskId) || taskId <= 0) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    if (
    subject_id === undefined ||
    !Number.isInteger(Number(subject_id)) ||
    Number(subject_id) <= 0 ||
    typeof title !== "string" ||
    !title.trim() ||
    typeof description !== "string" ||
    !description.trim() ||
    typeof code_content !== "string" ||
    !code_content.trim()
) {
    return res.status(400).json({
        message: "Valid subject, title, description and code are required"
    });
}
    try {
        const [result] = await db.query(
            `UPDATE code_to_logic_tasks
             SET subject_id = ?,
                 title = ?,
                 description = ?,
                 code_content = ?
             WHERE id = ? AND mentor_id = ?`,
            [
                Number(subject_id),
                title.trim(),
                description.trim(),
                code_content.trim(),
                taskId,
                mentorId
            ]
        );

        if (result.affectedRows === 0) {
            const [tasks] = await db.query(
                `SELECT id
                 FROM code_to_logic_tasks
                 WHERE id = ? AND mentor_id = ?`,
                [taskId, mentorId]
            );

            if (tasks.length === 0) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }
        }

        return res.status(200).json({
            message: "Task updated successfully"
        });
    } catch (error) {
        console.error("Update Code to Logic task error:", error);

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                message: "The selected subject does not exist"
            });
        }

        return res.status(500).json({
            message: "Failed to update task"
        });
    }
};


// PUBLISH A DRAFT TASK
const publishTask = async (req, res) => {
    const mentorId = req.user.id;
    const taskId = Number(req.params.taskId);

    if (!Number.isInteger(taskId) || taskId <= 0) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    try {
        const [tasks] = await db.query(
            `SELECT id, status
             FROM code_to_logic_tasks
             WHERE id = ? AND mentor_id = ?`,
            [taskId, mentorId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        if (tasks[0].status !== "draft") {
            return res.status(409).json({
                message: "Only draft tasks can be published"
            });
        }

        await db.query(
            `UPDATE code_to_logic_tasks
             SET status = 'published'
             WHERE id = ? AND mentor_id = ? AND status = 'draft'`,
            [taskId, mentorId]
        );

        return res.status(200).json({
            message: "Task published successfully"
        });
    } catch (error) {
        console.error("Publish Code to Logic task error:", error);

        return res.status(500).json({
            message: "Failed to publish task"
        });
    }
};


// DELETE A TASK WITHOUT SUBMISSIONS
const deleteTask = async (req, res) => {
    const mentorId = req.user.id;
    const taskId = Number(req.params.taskId);

    if (!Number.isInteger(taskId) || taskId <= 0) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    try {
        const [tasks] = await db.query(
            `SELECT id
             FROM code_to_logic_tasks
             WHERE id = ? AND mentor_id = ?`,
            [taskId, mentorId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const [submissions] = await db.query(
            `SELECT id
             FROM code_to_logic_submissions
             WHERE task_id = ?
             LIMIT 1`,
            [taskId]
        );

        if (submissions.length > 0) {
            return res.status(409).json({
                message: "This task has student submissions and cannot be deleted"
            });
        }

        await db.query(
            `DELETE FROM code_to_logic_tasks
             WHERE id = ? AND mentor_id = ?`,
            [taskId, mentorId]
        );

        return res.status(200).json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        console.error("Delete Code to Logic task error:", error);

        return res.status(500).json({
            message: "Failed to delete task"
        });
    }
};


module.exports = {
    getTaskById,
    updateTask,
    publishTask,
    deleteTask
};
