
const db = require("../../../../config/db");

// =====================================================
// SUBMIT A CODE SHUFFLE ATTEMPT
// =====================================================

const submitCodeShuffleAttempt = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const studentId = req.user.id;
        const taskId = Number(req.params.id);

        const {
            submittedOrder,
            hintsUsed = 0,
            timeTakenSeconds = 0
        } = req.body;

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        if (
            !Array.isArray(submittedOrder) ||
            submittedOrder.length === 0 ||
            !submittedOrder.every(
                (id) => Number.isInteger(Number(id)) && Number(id) > 0
            )
        ) {
            return res.status(400).json({
                message: "Submit an ordered list of code block IDs."
            });
        }

        const blockIds = submittedOrder.map(Number);

        if (new Set(blockIds).size !== blockIds.length) {
            return res.status(400).json({
                message: "Duplicate code blocks are not allowed."
            });
        }

        if (
            !Number.isInteger(hintsUsed) ||
            hintsUsed < 0 ||
            !Number.isInteger(timeTakenSeconds) ||
            timeTakenSeconds < 0
        ) {
            return res.status(400).json({
                message: "Invalid hint count or time taken."
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        // Verify that the task is currently published.
        const [tasks] = await connection.execute(
            `SELECT id, max_marks
             FROM code_shuffle_tasks
             WHERE id = ?
               AND status = 'published'
             FOR UPDATE`,
            [taskId]
        );

        if (tasks.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                message: "Published Code Shuffle task not found."
            });
        }

        const task = tasks[0];
        const maxMarks = Number(task.max_marks);

        // Lock existing progress to prevent duplicate completion attempts.
        const [progressRows] = await connection.execute(
            `SELECT status
             FROM code_shuffle_progress
             WHERE student_id = ?
               AND task_id = ?
             FOR UPDATE`,
            [studentId, taskId]
        );

        if (
            progressRows.length > 0 &&
            progressRows[0].status === "completed"
        ) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(409).json({
                message: "You have already completed this task."
            });
        }

        // Keep the answer key private on the backend.
        const [allBlocks] = await connection.execute(
            `SELECT id, block_type, correct_position
             FROM code_shuffle_blocks
             WHERE task_id = ?`,
            [taskId]
        );

        const availableBlockIds = new Set(
            allBlocks.map((block) => Number(block.id))
        );

        if (!blockIds.every((id) => availableBlockIds.has(id))) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "The submission contains blocks that do not belong to this task."
            });
        }

        const correctBlocks = allBlocks
            .filter((block) => block.block_type === "correct")
            .sort(
                (a, b) =>
                    Number(a.correct_position) -
                    Number(b.correct_position)
            );

        if (correctBlocks.length < 2) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "This task does not have a valid answer key."
            });
        }

        const expectedOrder = correctBlocks.map(
            (block) => Number(block.id)
        );

        // Award marks for correct blocks in their exact positions.
        let correctPositions = 0;

        expectedOrder.forEach((expectedId, index) => {
            if (blockIds[index] === expectedId) {
                correctPositions += 1;
            }
        });

        const isCorrect =
            blockIds.length === expectedOrder.length &&
            blockIds.every(
                (id, index) => id === expectedOrder[index]
            );

        const score = Number(
            (
                (correctPositions / expectedOrder.length) *
                maxMarks
            ).toFixed(2)
        );

        const progressStatus = isCorrect
            ? "completed"
            : "in_progress";

        // Store the submitted order, never the answer key in the response.
     // Calculate the next attempt number for this student and task.
const [attemptRows] = await connection.execute(
    `SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt_number
     FROM code_shuffle_attempts
     WHERE student_id = ?
       AND task_id = ?`,
    [studentId, taskId]
);

const attemptNumber = Number(
    attemptRows[0].next_attempt_number
);

// Store the submitted order and attempt number.
await connection.execute(
    `INSERT INTO code_shuffle_attempts
        (
            student_id,
            task_id,
            attempt_number,
            submitted_order,
            score,
            max_marks,
            hints_used,
            time_taken_seconds,
            is_correct
        )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
        studentId,
        taskId,
        attemptNumber,
        JSON.stringify(blockIds),
        score,
        maxMarks,
        hintsUsed,
        timeTakenSeconds,
        isCorrect ? 1 : 0
    ]
);

        // Keep first, latest, best scores and attempt count.
        await connection.execute(
            `INSERT INTO code_shuffle_progress
                (
                    student_id,
                    task_id,
                    status,
                    first_score,
                    latest_score,
                    best_score,
                    attempt_count,
                    completed_at
                )
             VALUES (?, ?, ?, ?, ?, ?, 1,
                     CASE WHEN ? = 1
                          THEN CURRENT_TIMESTAMP
                          ELSE NULL
                     END)
             ON DUPLICATE KEY UPDATE
                first_score = COALESCE(
                    first_score,
                    VALUES(first_score)
                ),
                latest_score = VALUES(latest_score),
                best_score = GREATEST(
                    COALESCE(best_score, 0),
                    VALUES(best_score)
                ),
                attempt_count = attempt_count + 1,
                status = VALUES(status),
                completed_at = CASE
                    WHEN VALUES(status) = 'completed'
                    THEN COALESCE(
                        completed_at,
                        CURRENT_TIMESTAMP
                    )
                    ELSE completed_at
                END`,
            [
                studentId,
                taskId,
                progressStatus,
                score,
                score,
                score,
                isCorrect ? 1 : 0
            ]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            message: isCorrect
                ? "Excellent! You completed the Code Shuffle task."
                : "Attempt saved. Review your code order and try again.",
            score,
            maxMarks,
            correctPositions,
            totalCorrectBlocks: expectedOrder.length,
            isCorrect,
            progressStatus
        });
    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error("Submit Code Shuffle attempt error:", error);

        return res.status(500).json({
            message: "Failed to submit the Code Shuffle attempt."
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    submitCodeShuffleAttempt
};
