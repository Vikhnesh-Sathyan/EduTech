
const db = require("../../../../config/db");

// =====================================================
// DELETE A DRAFT LOGIC TO CODE PROBLEM
// =====================================================

const deleteDraftProblem = async (req, res) => {
    let connection;

    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                message: "Invalid problem ID."
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Find the mentor's own draft and lock the row.
        const [problems] = await connection.execute(
            `SELECT id
             FROM code_logic_problems
             WHERE id = ?
               AND mentor_id = ?
               AND status = 'draft'
             FOR UPDATE`,
            [problemId, mentorId]
        );

        if (problems.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Draft problem not found or you do not have permission to delete it."
            });
        }

        // Check whether students have already attempted this problem.
        
        // Check whether students have attempted this problem.
        const [attempts] = await connection.execute(
            `SELECT id
             FROM code_logic_attempts
             WHERE problem_id = ?
             LIMIT 1`,
            [problemId]
        );

        // Check whether student progress records exist.
        const [progress] = await connection.execute(
            `SELECT id
             FROM code_logic_progress
             WHERE problem_id = ?
             LIMIT 1`,
            [problemId]
        );

        // Preserve student attempts and progress.
        if (attempts.length > 0 || progress.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                message:
                    "This problem has student attempts or progress records and cannot be permanently deleted."
            });
        }


        // The content and concept links are deleted automatically
        // through their foreign keys with ON DELETE CASCADE.
        await connection.execute(
            `DELETE FROM code_logic_problems
             WHERE id = ?
               AND mentor_id = ?
               AND status = 'draft'`,
            [problemId, mentorId]
        );

        await connection.commit();

        return res.status(200).json({
            message: "Draft problem deleted successfully.",
            problemId
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Delete Logic to Code draft problem error:",
            error
        );

        return res.status(500).json({
            message: "Failed to delete the draft problem."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    deleteDraftProblem
};
