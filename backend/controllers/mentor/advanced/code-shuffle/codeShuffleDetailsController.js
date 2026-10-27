
const db = require("../../../../config/db");

// =====================================================
// GET ONE TASK CREATED BY THE LOGGED-IN MENTOR
// Includes the answer blocks for the mentor's editor only.
// =====================================================

const getTaskById = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const taskId = Number(req.params.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        const [tasks] = await db.query(
            `SELECT
                t.id,
                t.title,
                t.description,
                t.language_id,
                l.name AS language_name,
                t.difficulty,
                t.max_marks,
                t.hint_text,
                t.publish_date,
                t.due_date,
                t.status,
                t.created_at,
                t.updated_at
             FROM code_shuffle_tasks t
             JOIN code_shuffle_languages l
                ON l.id = t.language_id
             WHERE t.id = ?
               AND t.mentor_id = ?
             LIMIT 1`,
            [taskId, mentorId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        const [topics] = await db.query(
            `SELECT
                topic.id,
                topic.name,
                topic.description
             FROM code_shuffle_task_topics taskTopic
             JOIN code_shuffle_topics topic
                ON topic.id = taskTopic.topic_id
             WHERE taskTopic.task_id = ?
               AND topic.mentor_id = ?
             ORDER BY topic.name ASC`,
            [taskId, mentorId]
        );

        const [blocks] = await db.query(
            `SELECT
                id,
                block_content,
                block_type,
                correct_position
             FROM code_shuffle_blocks
             WHERE task_id = ?
             ORDER BY
                CASE
                    WHEN block_type = 'correct'
                    THEN correct_position
                    ELSE 2147483647
                END,
                id ASC`,
            [taskId]
        );

        const correctBlocks = blocks.filter(
            block => block.block_type === "correct"
        );

        const distractorBlocks = blocks.filter(
            block => block.block_type === "distractor"
        );

        return res.status(200).json({
            task: tasks[0],
            topics,
            correctBlocks,
            distractorBlocks
        });
    } catch (error) {
        console.error("Get Code Shuffle task details error:", error);

        return res.status(500).json({
            message: "Failed to fetch task details."
        });
    }
};

module.exports = {
    getTaskById
};
