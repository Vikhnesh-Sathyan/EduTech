
const db = require("../../../../config/db");

// =====================================================
// PUBLISH A CODE SHUFFLE TASK
// =====================================================

const publishTask = async (req, res) => {
    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
        const mentorId = req.user.id;
        const taskId = Number(req.params.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        await connection.beginTransaction();
        transactionStarted = true;

        // Verify ownership and lock the task row.
        const [tasks] = await connection.execute(
            `SELECT id, status, publish_date, max_marks
             FROM code_shuffle_tasks
             WHERE id = ? AND mentor_id = ?
             FOR UPDATE`,
            [taskId, mentorId]
        );

        if (tasks.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                message: "Task not found."
            });
        }

        const task = tasks[0];

        if (task.status !== "draft") {
            await connection.rollback();
            transactionStarted = false;

            return res.status(409).json({
                message: "Only draft tasks can be published."
            });
        }

        // A publish date is required for daily task scheduling.
        if (!task.publish_date) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "Set a publish date before publishing this task."
            });
        }

        // Verify the task has enough correct blocks.
        const [correctBlocks] = await connection.execute(
            `SELECT id, correct_position
             FROM code_shuffle_blocks
             WHERE task_id = ?
               AND block_type = 'correct'
             ORDER BY correct_position ASC`,
            [taskId]
        );

        if (
            correctBlocks.length < 2 ||
            correctBlocks.some(
                (block, index) => block.correct_position !== index + 1
            )
        ) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "Add at least two correctly ordered code blocks before publishing."
            });
        }

        // Verify that the task has at least one active topic.
        const [topics] = await connection.execute(
            `SELECT topic.id
             FROM code_shuffle_task_topics taskTopic
             JOIN code_shuffle_topics topic
               ON topic.id = taskTopic.topic_id
             WHERE taskTopic.task_id = ?
               AND topic.mentor_id = ?
               AND topic.status = 'active'`,
            [taskId, mentorId]
        );

        if (topics.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "The task must have at least one active topic."
            });
        }

        // Publish only after all validations pass.
        await connection.execute(
            `UPDATE code_shuffle_tasks
             SET status = 'published'
             WHERE id = ? AND mentor_id = ?`,
            [taskId, mentorId]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            message: "Code Shuffle task published successfully.",
            taskId
        });
    } catch (error) {
        if (transactionStarted) {
            await connection.rollback();
        }

        console.error("Publish Code Shuffle task error:", error);

        return res.status(500).json({
            message: "Failed to publish the Code Shuffle task."
        });
    } finally {
        connection.release();
    }
};

// =====================================================
// UNPUBLISH A CODE SHUFFLE TASK
// =====================================================

const unpublishTask = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const taskId = Number(req.params.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        const [result] = await db.execute(
            `UPDATE code_shuffle_tasks
             SET status = 'draft'
             WHERE id = ?
               AND mentor_id = ?
               AND status = 'published'`,
            [taskId, mentorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Published task not found."
            });
        }

        return res.status(200).json({
            message: "Code Shuffle task unpublished successfully.",
            taskId
        });
    } catch (error) {
        console.error("Unpublish Code Shuffle task error:", error);

        return res.status(500).json({
            message: "Failed to unpublish the Code Shuffle task."
        });
    }
};

module.exports = {
    publishTask,
    unpublishTask
};
