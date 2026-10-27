
const db = require("../../../../config/db");

// =====================================================
// GET PUBLISHED CODE SHUFFLE TASKS
// =====================================================

const getPublishedTasks = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [tasks] = await db.execute(
            `SELECT
                task.id,
                task.title,
                task.description,
                task.difficulty,
                task.max_marks,
                task.hint_text,
                task.publish_date,
                task.due_date,
                language.id AS language_id,
                language.name AS language_name,
                GROUP_CONCAT(
                    DISTINCT topic.name
                    ORDER BY topic.name
                    SEPARATOR ', '
                ) AS topics,
                COUNT(DISTINCT block.id) AS total_blocks,
                progress.status AS progress_status,
                progress.first_score,
                progress.latest_score,
                progress.best_score,
                progress.attempt_count
            FROM code_shuffle_tasks task
            JOIN code_shuffle_languages language
                ON language.id = task.language_id
            LEFT JOIN code_shuffle_task_topics taskTopic
                ON taskTopic.task_id = task.id
            LEFT JOIN code_shuffle_topics topic
                ON topic.id = taskTopic.topic_id
                AND topic.status = 'active'
            LEFT JOIN code_shuffle_blocks block
                ON block.task_id = task.id
            LEFT JOIN code_shuffle_progress progress
                ON progress.task_id = task.id
                AND progress.student_id = ?
            WHERE task.status = 'published'
              AND language.status = 'active'
            GROUP BY
                task.id,
                task.title,
                task.description,
                task.difficulty,
                task.max_marks,
                task.hint_text,
                task.publish_date,
                task.due_date,
                language.id,
                language.name,
                progress.status,
                progress.first_score,
                progress.latest_score,
                progress.best_score,
                progress.attempt_count
            ORDER BY
                task.publish_date DESC,
                task.id DESC`,
            [studentId]
        );

        return res.status(200).json({
            message: "Published Code Shuffle tasks retrieved successfully.",
            tasks
        });
    } catch (error) {
        console.error("Get published Code Shuffle tasks error:", error);

        return res.status(500).json({
            message: "Failed to retrieve published Code Shuffle tasks."
        });
    }
};


const getPublishedTaskById = async (req, res) => {
    try {
        const taskId = Number(req.params.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        // Only retrieve published tasks with active languages.
        const [tasks] = await db.execute(
            `SELECT
                task.id,
                task.title,
                task.description,
                task.difficulty,
                task.max_marks,
                task.hint_text,
                task.publish_date,
                task.due_date,
                language.name AS language_name
             FROM code_shuffle_tasks task
             JOIN code_shuffle_languages language
                ON language.id = task.language_id
             WHERE task.id = ?
               AND task.status = 'published'
               AND language.status = 'active'`,
            [taskId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                message: "Published task not found."
            });
        }

        const task = tasks[0];

        // Return only block IDs and content.
        // Never send block_type or correct_position to students.
        const [blocks] = await db.execute(
            `SELECT id, block_content
             FROM code_shuffle_blocks
             WHERE task_id = ?`,
            [taskId]
        );

        if (blocks.length < 2) {
            return res.status(400).json({
                message: "This task does not have enough code blocks."
            });
        }

        // Shuffle the blocks using Fisher-Yates.
        for (let i = blocks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
        }

        return res.status(200).json({
            message: "Code Shuffle task retrieved successfully.",
            task,
            blocks
        });
    } catch (error) {
        console.error("Get Code Shuffle task error:", error);

        return res.status(500).json({
            message: "Failed to retrieve the Code Shuffle task."
        });
    }
};


const getMyTaskAttempts = async (req, res) => {
    try {
        const studentId = req.user.id;
        const taskId = Number(req.params.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        // Confirm that the task is published.
        const [tasks] = await db.execute(
            `SELECT id, max_marks
             FROM code_shuffle_tasks
             WHERE id = ?
               AND status = 'published'`,
            [taskId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                message: "Published task not found."
            });
        }

        // Return only this student's attempts.
        // Do not return the correct answer or correct positions.
        const [attempts] = await db.execute(
            `SELECT
                id,
                score,
                max_marks,
                hints_used,
                time_taken_seconds,
                is_correct,
                submitted_at
             FROM code_shuffle_attempts
             WHERE student_id = ?
               AND task_id = ?
             ORDER BY submitted_at DESC, id DESC`,
            [studentId, taskId]
        );

        const [progressRows] = await db.execute(
            `SELECT
                status,
                first_score,
                latest_score,
                best_score,
                attempt_count,
                completed_at
             FROM code_shuffle_progress
             WHERE student_id = ?
               AND task_id = ?
             LIMIT 1`,
            [studentId, taskId]
        );

        return res.status(200).json({
            message: "Attempt history retrieved successfully.",
            progress: progressRows.length > 0
                ? progressRows[0]
                : null,
            attempts
        });
    } catch (error) {
        console.error("Get Code Shuffle attempt history error:", error);

        return res.status(500).json({
            message: "Failed to retrieve attempt history."
        });
    }
};


module.exports = {
    getPublishedTasks,
    getPublishedTaskById,
    getMyTaskAttempts
};
