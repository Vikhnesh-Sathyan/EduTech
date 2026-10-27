const db = require("../../../../config/db");

const deleteTask = async (req, res) => {
    let connection;

    try {
        const mentorId = req.user.id;
        const taskId = Number(req.params.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid Code Shuffle task ID."
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Ensure the task belongs to the logged-in mentor.
        const [tasks] = await connection.execute(
            `SELECT id
             FROM code_shuffle_tasks
             WHERE id = ? AND mentor_id = ?
             FOR UPDATE`,
            [taskId, mentorId]
        );

        if (tasks.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Task not found or you do not have permission to delete it."
            });
        }

        // Delete related records first.
        await connection.execute(
            `DELETE FROM code_shuffle_task_topics
             WHERE task_id = ?`,
            [taskId]
        );

        await connection.execute(
            `DELETE FROM code_shuffle_blocks
             WHERE task_id = ?`,
            [taskId]
        );

        // Delete the mentor's task.
        await connection.execute(
            `DELETE FROM code_shuffle_tasks
             WHERE id = ? AND mentor_id = ?`,
            [taskId, mentorId]
        );

        await connection.commit();

        return res.status(200).json({
            message: "Code Shuffle task deleted successfully."
        });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Delete task rollback error:", rollbackError);
            }
        }

        console.error("Delete Code Shuffle task error:", error);

        return res.status(500).json({
            message: "Failed to delete the Code Shuffle task."
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = { deleteTask };