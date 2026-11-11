
const db = require("../../../config/db");

// ==========================================
// DELETE DRAFT DAILY QUIZ
// ==========================================
const deleteDailyQuiz = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const quizId = Number(req.params.quizId);

        // ----------------------------------
        // VALIDATE QUIZ ID
        // ----------------------------------
        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                message: "Valid quiz ID is required"
            });
        }

        // ----------------------------------
        // START TRANSACTION
        // ----------------------------------
        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        // ----------------------------------
        // FIND AND LOCK QUIZ
        // ----------------------------------
        const [quizzes] = await connection.query(
            `SELECT id, status
             FROM daily_quizzes
             WHERE id = ?
             FOR UPDATE`,
            [quizId]
        );

        if (quizzes.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                message: "Daily quiz not found"
            });
        }

        // ----------------------------------
        // ALLOW ONLY DRAFT QUIZZES
        // ----------------------------------
        if (quizzes[0].status !== "draft") {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "Only draft quizzes can be deleted"
            });
        }

        // ----------------------------------
        // CHECK STUDENT ATTEMPTS
        // ----------------------------------
        const [attempts] = await connection.query(
            `SELECT id
             FROM daily_quiz_attempts
             WHERE daily_quiz_id = ?
             LIMIT 1`,
            [quizId]
        );

        if (attempts.length > 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "This quiz cannot be deleted because student attempts exist"
            });
        }

        // ----------------------------------
        // DELETE QUIZ
        // ----------------------------------
        await connection.query(
            `DELETE FROM daily_quizzes
             WHERE id = ?`,
            [quizId]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            message: "Draft daily quiz deleted successfully",
            deleted_quiz_id: quizId
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
            transactionStarted = false;
        }

        console.error("Delete daily quiz error:", error);

        return res.status(500).json({
            message: "Failed to delete daily quiz"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


// ==========================================
// EXPORT CONTROLLER
// ==========================================
module.exports = {
    deleteDailyQuiz
};
