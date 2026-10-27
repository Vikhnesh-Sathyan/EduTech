
const db = require("../../../../config/db");

// ================================================
// SAVE ACTIVE CODE SHUFFLE BLOCK ORDER
// ================================================

const saveActiveTaskOrder = async (req, res) => {
    try {
        const taskId = Number(req.params.id);
        const studentId = req.user.id;
        const { currentOrder } = req.body;

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        if (
            !Array.isArray(currentOrder) ||
            currentOrder.length < 2 ||
            !currentOrder.every(
                id => Number.isInteger(Number(id)) && Number(id) > 0
            )
        ) {
            return res.status(400).json({
                message: "Invalid code block order."
            });
        }

        // Confirm that the task is published.
        const [tasks] = await db.execute(
            `SELECT id
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

        // Get the valid block IDs for this task.
        const [blocks] = await db.execute(
            `SELECT id
             FROM code_shuffle_blocks
             WHERE task_id = ?`,
            [taskId]
        );

        const validIds = blocks.map(block => Number(block.id));
        const submittedIds = currentOrder.map(Number);

        // Require every block exactly once.
        if (
            submittedIds.length !== validIds.length ||
            new Set(submittedIds).size !== submittedIds.length ||
            !submittedIds.every(id => validIds.includes(id))
        ) {
            return res.status(400).json({
                message: "The order must contain every task block exactly once."
            });
        }

        // Save the order for this student's active attempt.
        const [result] = await db.execute(
            `UPDATE code_shuffle_active_attempts
             SET current_order = ?
             WHERE student_id = ?
               AND task_id = ?`,
            [
                JSON.stringify(submittedIds),
                studentId,
                taskId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "No active attempt found. Reload the challenge."
            });
        }

        return res.status(200).json({
            message: "Code block order saved successfully."
        });
    } catch (error) {
        console.error("Save active Code Shuffle order error:", error);

        return res.status(500).json({
            message: "Failed to save the code block order."
        });
    }
};

module.exports = {
    saveActiveTaskOrder
};
