
const db = require("../../../config/db");

// =====================================================
// GET INDIA CURRENT DATE TIME
// =====================================================

const getIndiaDateTime = () => {
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

    return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
};


// =====================================================
// SUBMIT DAILY QUIZ
// =====================================================

const submitDailyQuiz = async (req, res) => {

    const connection = await db.getConnection();

    try {

        const studentId = req.user.id;
        const quizId = Number(req.params.quizId);
        const { answers } = req.body;

        // -------------------------------------------------
        // VALIDATE QUIZ ID
        // -------------------------------------------------

        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID."
            });
        }

        // -------------------------------------------------
        // VALIDATE ANSWERS
        // -------------------------------------------------

        if (!Array.isArray(answers) || answers.length !== 3) {
            return res.status(400).json({
                success: false,
                message: "Exactly three answers are required."
            });
        }

        const questionIds = answers.map(answer =>
            Number(answer.question_id)
        );

        if (
            questionIds.some(id => !Number.isInteger(id) || id <= 0) ||
            new Set(questionIds).size !== 3
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid or duplicate question IDs."
            });
        }

        for (const answer of answers) {

            if (
                answer.selected_option_id !== null &&
                answer.selected_option_id !== undefined &&
                (!Number.isInteger(Number(answer.selected_option_id)) ||
                    Number(answer.selected_option_id) <= 0)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid selected option ID."
                });
            }
        }

        const indiaDateTime = getIndiaDateTime();

        // -------------------------------------------------
        // START TRANSACTION
        // -------------------------------------------------

        await connection.beginTransaction();

        // -------------------------------------------------
        // VERIFY QUIZ AND LOCK QUIZ ROW
        // -------------------------------------------------

        const [quizzes] = await connection.execute(
            `SELECT id, subject_id, status, scheduled_at, expires_at
             FROM daily_quizzes
             WHERE id = ?
             FOR UPDATE`,
            [quizId]
        );

        if (quizzes.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Daily quiz not found."
            });
        }

        const quiz = quizzes[0];

        if (quiz.status !== "published") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "This quiz is not available."
            });
        }

        // -------------------------------------------------
        // CHECK PUBLICATION AND EXPIRY TIME
        // -------------------------------------------------

        const [timeCheck] = await connection.execute(
            `SELECT
                (scheduled_at <= ?) AS is_started,
                (expires_at > ?) AS is_active
             FROM daily_quizzes
             WHERE id = ?`,
            [indiaDateTime, indiaDateTime, quizId]
        );

        if (!timeCheck[0].is_started) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "This quiz has not started yet."
            });
        }

        if (!timeCheck[0].is_active) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "The quiz submission period has expired."
            });
        }

        // -------------------------------------------------
        // CHECK SUBJECT ENROLLMENT
        // -------------------------------------------------

        const [enrollment] = await connection.execute(
            `SELECT id
             FROM student_subjects
             WHERE student_id = ?
             AND subject_id = ?
             LIMIT 1`,
            [studentId, quiz.subject_id]
        );

        if (enrollment.length === 0) {
            await connection.rollback();

            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this subject."
            });
        }

        // -------------------------------------------------
        // CHECK PREVIOUS ATTEMPT
        // -------------------------------------------------

        const [existingAttempts] = await connection.execute(
            `SELECT id
             FROM daily_quiz_attempts
             WHERE daily_quiz_id = ?
             AND student_id = ?
             LIMIT 1`,
            [quizId, studentId]
        );

        if (existingAttempts.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "You have already submitted this quiz."
            });
        }

        // -------------------------------------------------
        // FETCH QUIZ QUESTIONS
        // -------------------------------------------------

        const [questions] = await connection.execute(
            `SELECT id, question_text, question_order
             FROM daily_quiz_questions
             WHERE daily_quiz_id = ?
             ORDER BY question_order`,
            [quizId]
        );

        if (questions.length !== 3) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "This quiz does not contain exactly three questions."
            });
        }

        const actualQuestionIds = questions.map(question => question.id);

        if (
            !actualQuestionIds.every(id => questionIds.includes(id))
        ) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Submitted questions do not belong to this quiz."
            });
        }

        // -------------------------------------------------
        // FETCH OPTIONS AND CORRECT ANSWERS
        // -------------------------------------------------

        const [options] = await connection.execute(
            `SELECT
                o.id,
                o.question_id,
                o.option_text,
                o.is_correct
             FROM daily_quiz_options o
             INNER JOIN daily_quiz_questions q
                ON q.id = o.question_id
             WHERE q.daily_quiz_id = ?
             ORDER BY q.question_order, o.option_order`,
            [quizId]
        );

        // -------------------------------------------------
        // CALCULATE SCORE
        // -------------------------------------------------

        let correctAnswers = 0;
        let wrongAnswers = 0;

        const reviewedAnswers = [];

        for (const question of questions) {

            const submittedAnswer = answers.find(
                answer => Number(answer.question_id) === question.id
            );

            const selectedOptionId =
                submittedAnswer.selected_option_id == null
                    ? null
                    : Number(submittedAnswer.selected_option_id);

            const questionOptions = options.filter(
                option => option.question_id === question.id
            );

            if (questionOptions.length !== 3) {
                throw new Error("Invalid quiz option configuration.");
            }

            const selectedOption = selectedOptionId === null
                ? null
                : questionOptions.find(
                    option => option.id === selectedOptionId
                );

            if (selectedOptionId !== null && !selectedOption) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Selected option does not belong to its question."
                });
            }

            const correctOption = questionOptions.find(
                option => Number(option.is_correct) === 1
            );

            if (!correctOption) {
                throw new Error("Correct answer is missing.");
            }

            const isCorrect =
                selectedOption !== null &&
                selectedOption.id === correctOption.id;

            if (isCorrect) {
                correctAnswers++;
            } else if (selectedOption !== null) {
                wrongAnswers++;
            }

            reviewedAnswers.push({
                question_id: question.id,
                question_text: question.question_text,
                selected_option_id: selectedOptionId,
                selected_answer: selectedOption
                    ? selectedOption.option_text
                    : null,
                correct_option_id: correctOption.id,
                correct_answer: correctOption.option_text,
                is_correct: isCorrect,
                options: questionOptions.map(option => ({
                    id: option.id,
                    option_text: option.option_text
                }))
            });
        }

        // -------------------------------------------------
        // SAVE ATTEMPT
        // -------------------------------------------------

        const [attemptResult] = await connection.execute(
            `INSERT INTO daily_quiz_attempts
                (
                    daily_quiz_id,
                    student_id,
                    total_questions,
                    correct_answers,
                    wrong_answers,
                    score
                )
             VALUES (?, ?, 3, ?, ?, ?)`,
            [
                quizId,
                studentId,
                correctAnswers,
                wrongAnswers,
                correctAnswers
            ]
        );

        const attemptId = attemptResult.insertId;

        // -------------------------------------------------
        // SAVE INDIVIDUAL ANSWERS
        // -------------------------------------------------

        for (const answer of reviewedAnswers) {

            await connection.execute(
                `INSERT INTO daily_quiz_attempt_answers
                    (
                        attempt_id,
                        question_id,
                        selected_option_id,
                        is_correct
                    )
                 VALUES (?, ?, ?, ?)`,
                [
                    attemptId,
                    answer.question_id,
                    answer.selected_option_id,
                    answer.is_correct ? 1 : 0
                ]
            );
        }

        // -------------------------------------------------
        // COMMIT TRANSACTION
        // -------------------------------------------------

        await connection.commit();

        // -------------------------------------------------
        // RETURN IMMEDIATE RESULT
        // -------------------------------------------------

        return res.status(201).json({
            success: true,
            message: "Daily quiz submitted successfully.",
            result: {
                attempt_id: attemptId,
                quiz_id: quizId,
                total_questions: 3,
                correct_answers: correctAnswers,
                wrong_answers: wrongAnswers,
                unanswered: 3 - correctAnswers - wrongAnswers,
                score: correctAnswers,
                submitted_at: indiaDateTime,
                answers: reviewedAnswers
            }
        });

    } catch (error) {

        await connection.rollback();

        // Unique constraint protects against concurrent submissions.
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "You have already submitted this quiz."
            });
        }

        console.error("Submit Daily Quiz Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to submit daily quiz."
        });

    } finally {

        connection.release();

    }
};


// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {
    submitDailyQuiz
};
