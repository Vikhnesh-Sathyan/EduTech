
const db = require("../../../../config/db");

// =====================================================
// UPDATE A CODE SHUFFLE DRAFT
// Replaces the task's topics and code blocks safely.
// =====================================================

const updateTask = async (req, res) => {
    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
        const mentorId = req.user.id;
        const taskId = Number(req.params.id);

        const {
            title,
            description,
            languageId,
            difficulty,
            maxMarks,
            hintText,
            publishDate,
            dueDate,
            topicIds,
            correctBlocks,
            distractorBlocks
        } = req.body;

        // Validate task ID.
        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        // Validate basic task details.
        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof description !== "string" ||
            !description.trim() ||
            !Number.isInteger(Number(languageId)) ||
            Number(languageId) <= 0 ||
            !["easy", "medium", "hard"].includes(difficulty) ||
            !Number.isFinite(Number(maxMarks)) ||
            Number(maxMarks) <= 0
        ) {
            return res.status(400).json({
                message: "Please provide valid task details."
            });
        }

        // Validate topics.
        if (
            !Array.isArray(topicIds) ||
            topicIds.length === 0 ||
            topicIds.some(
                id => !Number.isInteger(Number(id)) || Number(id) <= 0
            ) ||
            new Set(topicIds.map(Number)).size !== topicIds.length
        ) {
            return res.status(400).json({
                message: "Select at least one valid topic."
            });
        }

        // Validate correct blocks.
        if (
            !Array.isArray(correctBlocks) ||
            correctBlocks.length < 2 ||
            correctBlocks.some(
                block => typeof block !== "string" || !block.trim()
            )
        ) {
            return res.status(400).json({
                message: "Provide at least two non-empty correct code blocks."
            });
        }

        // Validate distractors.
        const safeDistractorBlocks =
            distractorBlocks === undefined ? [] : distractorBlocks;

        if (
            !Array.isArray(safeDistractorBlocks) ||
            safeDistractorBlocks.some(
                block => typeof block !== "string" || !block.trim()
            )
        ) {
            return res.status(400).json({
                message: "Each distractor must contain non-empty code."
            });
        }

        if (
            hintText !== undefined &&
            hintText !== null &&
            typeof hintText !== "string"
        ) {
            return res.status(400).json({
                message: "Hint must be text."
            });
        }

        if (
            publishDate !== undefined &&
            publishDate !== null &&
            (
                typeof publishDate !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(publishDate) ||
                Number.isNaN(Date.parse(`${publishDate}T00:00:00Z`))
            )
        ) {
            return res.status(400).json({
                message: "Publish date must use YYYY-MM-DD format."
            });
        }

        if (
            dueDate !== undefined &&
            dueDate !== null &&
            (
                typeof dueDate !== "string" ||
                Number.isNaN(Date.parse(dueDate))
            )
        ) {
            return res.status(400).json({
                message: "Due date must be a valid date and time."
            });
        }

        // Start transaction before checking and modifying the task.
        await connection.beginTransaction();
        transactionStarted = true;

        // Lock the task row while checking ownership and status.
        const [tasks] = await connection.execute(
            `SELECT id, status
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

        if (tasks[0].status !== "draft") {
            await connection.rollback();
            transactionStarted = false;

            return res.status(409).json({
                message: "Only draft tasks can be edited."
            });
        }

        // Verify that the language is active.
        const [languages] = await connection.execute(
            `SELECT id
             FROM code_shuffle_languages
             WHERE id = ? AND status = 'active'`,
            [Number(languageId)]
        );

        if (languages.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "The selected programming language is invalid or inactive."
            });
        }

        // Verify all selected topics belong to this mentor.
        const placeholders = topicIds.map(() => "?").join(", ");

        const [topics] = await connection.execute(
            `SELECT id
             FROM code_shuffle_topics
             WHERE mentor_id = ?
               AND status = 'active'
               AND id IN (${placeholders})`,
            [mentorId, ...topicIds.map(Number)]
        );

        if (topics.length !== topicIds.length) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "One or more selected topics are invalid or do not belong to you."
            });
        }

        // Update the task's basic details.
        await connection.execute(
            `UPDATE code_shuffle_tasks
             SET language_id = ?,
                 title = ?,
                 description = ?,
                 difficulty = ?,
                 max_marks = ?,
                 hint_text = ?,
                 publish_date = ?,
                 due_date = ?
             WHERE id = ? AND mentor_id = ?`,
            [
                Number(languageId),
                title.trim(),
                description.trim(),
                difficulty,
                Number(maxMarks),
                typeof hintText === "string" && hintText.trim()
                    ? hintText.trim()
                    : null,
                publishDate || null,
                dueDate || null,
                taskId,
                mentorId
            ]
        );

        // Replace the task-topic links.
        await connection.execute(
            `DELETE FROM code_shuffle_task_topics
             WHERE task_id = ?`,
            [taskId]
        );

        for (const topicId of topicIds) {
            await connection.execute(
                `INSERT INTO code_shuffle_task_topics
                    (task_id, topic_id)
                 VALUES (?, ?)`,
                [taskId, Number(topicId)]
            );
        }

        // Replace all code blocks for this draft.
        await connection.execute(
            `DELETE FROM code_shuffle_blocks
             WHERE task_id = ?`,
            [taskId]
        );

        // Save correct blocks in their new correct order.
        for (let index = 0; index < correctBlocks.length; index++) {
            await connection.execute(
                `INSERT INTO code_shuffle_blocks
                    (task_id, block_content, block_type, correct_position)
                 VALUES (?, ?, 'correct', ?)`,
                [taskId, correctBlocks[index].trim(), index + 1]
            );
        }

        // Save distractors without a correct position.
        for (const block of safeDistractorBlocks) {
            await connection.execute(
                `INSERT INTO code_shuffle_blocks
                    (task_id, block_content, block_type, correct_position)
                 VALUES (?, ?, 'distractor', NULL)`,
                [taskId, block.trim()]
            );
        }

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            message: "Code Shuffle draft updated successfully.",
            taskId
        });
    } catch (error) {
        if (transactionStarted) {
            await connection.rollback();
        }

        console.error("Update Code Shuffle task error:", error);

        return res.status(500).json({
            message: "Failed to update the Code Shuffle task."
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    updateTask
};
