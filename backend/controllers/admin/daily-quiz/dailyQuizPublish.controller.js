
const db = require("../../../config/db");

// ==========================================
// PUBLISH DAILY QUIZ
// ==========================================
const publishDailyQuiz = async (req, res) => {
    let connection;

    try {
        const quizId = Number(req.params.quizId);

        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID."
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        // Lock quiz while validating and publishing
        const [quizRows] = await connection.query(
            `SELECT id, status, scheduled_at
             FROM daily_quizzes
             WHERE id = ?
             FOR UPDATE`,
            [quizId]
        );

        if (quizRows.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Daily quiz not found."
            });
        }

        const quiz = quizRows[0];

        if (quiz.status !== "draft") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Only draft quizzes can be published."
            });
        }

        // Check scheduled time
        const [timeRows] = await connection.query(
            `SELECT scheduled_at > UTC_TIMESTAMP() AS is_future
             FROM daily_quizzes
             WHERE id = ?`,
            [quizId]
        );

        if (!timeRows[0].is_future) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Quiz publication date and time must be in the future."
            });
        }

        // Get all questions
        const [questions] = await connection.query(
            `SELECT id
             FROM daily_quiz_questions
             WHERE daily_quiz_id = ?
             ORDER BY question_order`,
            [quizId]
        );

        if (questions.length !== 3) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "A daily quiz must contain exactly 3 questions."
            });
        }

        // Validate options for every question
        for (const question of questions) {

            const [options] = await connection.query(
                `SELECT
                    COUNT(*) AS total_options,
                    SUM(is_correct = 1) AS correct_options
                 FROM daily_quiz_options
                 WHERE question_id = ?`,
                [question.id]
            );

            const totalOptions = Number(options[0].total_options);
            const correctOptions = Number(options[0].correct_options);

            if (totalOptions !== 4) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: `Question ${question.id} must have exactly 4 options.`
                });
            }

            if (correctOptions !== 1) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: `Question ${question.id} must have exactly 1 correct option.`
                });
            }
        }

        // Check attempts before publishing
        const [attempts] = await connection.query(
            `SELECT COUNT(*) AS total
             FROM daily_quiz_attempts
             WHERE daily_quiz_id = ?`,
            [quizId]
        );

        if (Number(attempts[0].total) > 0) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Quiz with existing attempts cannot be published again."
            });
        }

        // Publish the quiz
        await connection.query(
            `UPDATE daily_quizzes
             SET status = 'published'
             WHERE id = ?`,
            [quizId]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Daily quiz published and scheduled successfully."
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Publish Daily Quiz Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to publish daily quiz."
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    publishDailyQuiz
};
