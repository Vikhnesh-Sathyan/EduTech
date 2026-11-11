
const db = require("../../../config/db");

// =====================================================
// GET DAILY QUIZ QUESTIONS
// =====================================================

const getDailyQuizQuestions = async (req, res) => {
    try {
        const studentId = req.user.id;
        const quizId = Number(req.params.quizId);

        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID."
            });
        }

        // Get current India date and time.
        const parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23"
        }).formatToParts(new Date());

        const values = {};

        parts.forEach((part) => {
            values[part.type] = part.value;
        });

        const indiaDateTime =
            `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;

        // Check quiz availability and student enrollment.
        const [quizzes] = await db.execute(
            `SELECT
                dq.id,
                dq.title,
                dq.instructions,
                dq.expires_at,
                s.name AS subject_name

            FROM daily_quizzes dq

            INNER JOIN student_subjects ss
                ON ss.subject_id = dq.subject_id
                AND ss.student_id = ?

            INNER JOIN subjects s
                ON s.id = dq.subject_id

            WHERE dq.id = ?
                AND dq.status = 'published'
                AND dq.scheduled_at <= ?
                AND dq.expires_at > ?

            LIMIT 1`,
            [
                studentId,
                quizId,
                indiaDateTime,
                indiaDateTime
            ]
        );

        if (quizzes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz is unavailable or expired."
            });
        }

        // Check whether the student already submitted.
        const [attempts] = await db.execute(
            `SELECT id
             FROM daily_quiz_attempts
             WHERE daily_quiz_id = ?
             AND student_id = ?
             LIMIT 1`,
            [quizId, studentId]
        );

        if (attempts.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You have already submitted this quiz.",
                already_submitted: true
            });
        }

        // Get questions without exposing correct answers.
        const [questions] = await db.execute(
            `SELECT
                id AS question_id,
                question_text,
                question_order

             FROM daily_quiz_questions

             WHERE daily_quiz_id = ?

             ORDER BY question_order ASC`,
            [quizId]
        );

        if (questions.length !== 3) {
            return res.status(500).json({
                success: false,
                message: "Quiz questions are not configured correctly."
            });
        }

        // Get options for all three questions.
        const [options] = await db.execute(
            `SELECT
                id AS option_id,
                question_id,
                option_text,
                option_order

             FROM daily_quiz_options

             WHERE question_id IN (?, ?, ?)

             ORDER BY question_id ASC, option_order ASC`,
            questions.map((question) => question.question_id)
        );

        // Attach options to their respective questions.
        const formattedQuestions = questions.map((question) => ({
            question_id: question.question_id,
            question_text: question.question_text,
            question_order: question.question_order,
            options: options
                .filter((option) =>
                    option.question_id === question.question_id
                )
                .map((option) => ({
                    option_id: option.option_id,
                    option_text: option.option_text,
                    option_order: option.option_order
                }))
        }));

        if (formattedQuestions.some(
            (question) => question.options.length !== 3
        )) {
            return res.status(500).json({
                success: false,
                message: "Quiz options are not configured correctly."
            });
        }

        return res.status(200).json({
            success: true,
            quiz: {
                id: quizzes[0].id,
                title: quizzes[0].title,
                instructions: quizzes[0].instructions,
                subject_name: quizzes[0].subject_name,
                expires_at: quizzes[0].expires_at,
                questions: formattedQuestions
            }
        });

    } catch (error) {
        console.error("Get Daily Quiz Questions Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load quiz questions."
        });
    }
};

module.exports = {
    getDailyQuizQuestions
};
