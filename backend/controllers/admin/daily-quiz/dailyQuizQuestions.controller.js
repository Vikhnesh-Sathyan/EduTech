const db = require("../../../config/db");

// ==========================================
// ADD QUESTIONS AND OPTIONS
// ==========================================
const addQuizQuestions = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const quizId = Number(req.params.quizId);
        const { questions } = req.body;

        // Validate quiz ID
        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                message: "Valid quiz ID is required"
            });
        }

        // Exactly 3 questions required
        if (!Array.isArray(questions) || questions.length !== 3) {
            return res.status(400).json({
                message: "Exactly 3 questions are required"
            });
        }

        // Validate every question and its options
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];

            if (
                !question ||
                typeof question.question_text !== "string" ||
                !question.question_text.trim()
            ) {
                return res.status(400).json({
                    message: `Question ${i + 1} is required`
                });
            }

            if (
                question.explanation !== undefined &&
                question.explanation !== null &&
                typeof question.explanation !== "string"
            ) {
                return res.status(400).json({
                    message: `Invalid explanation for question ${i + 1}`
                });
            }

            if (
                !Array.isArray(question.options) ||
                question.options.length !== 4
            ) {
                return res.status(400).json({
                    message: `Question ${i + 1} must have exactly 4 options`
                });
            }

            for (const option of question.options) {
                if (
                    !option ||
                    typeof option.option_text !== "string" ||
                    !option.option_text.trim() ||
                    option.option_text.trim().length > 500 ||
                    typeof option.is_correct !== "boolean"
                ) {
                    return res.status(400).json({
                        message: `Invalid option in question ${i + 1}`
                    });
                }
            }

            const correctCount = question.options.filter(
                option => option.is_correct === true
            ).length;

            if (correctCount !== 1) {
                return res.status(400).json({
                    message: `Question ${i + 1} must have exactly one correct option`
                });
            }
        }

        // Get database connection
        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        // Lock quiz while adding questions
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

        if (quizzes[0].status !== "draft") {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "Questions can only be added to draft quizzes"
            });
        }

        // Prevent adding questions more than once
        const [existingQuestions] = await connection.query(
            `SELECT id
             FROM daily_quiz_questions
             WHERE daily_quiz_id = ?
             LIMIT 1`,
            [quizId]
        );

        if (existingQuestions.length > 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(409).json({
                message: "Questions already exist for this quiz"
            });
        }

        // Insert all 3 questions and their options
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];

            const [questionResult] = await connection.query(
                `INSERT INTO daily_quiz_questions
                    (
                        daily_quiz_id,
                        question_text,
                        explanation,
                        question_order
                    )
                 VALUES (?, ?, ?, ?)`,
                [
                    quizId,
                    question.question_text.trim(),
                    question.explanation?.trim() || null,
                    i + 1
                ]
            );

            const questionId = questionResult.insertId;

            for (let j = 0; j < question.options.length; j++) {
                const option = question.options[j];

                await connection.query(
                    `INSERT INTO daily_quiz_options
                        (
                            question_id,
                            option_text,
                            is_correct,
                            option_order
                        )
                     VALUES (?, ?, ?, ?)`,
                    [
                        questionId,
                        option.option_text.trim(),
                        option.is_correct ? 1 : 0,
                        j + 1
                    ]
                );
            }
        }

        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            message: "Quiz questions and options added successfully",
            quiz_id: quizId,
            total_questions: 3,
            options_per_question: 4
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
            transactionStarted = false;
        }

        console.error("Add daily quiz questions error:", error);

        return res.status(500).json({
            message: "Failed to add quiz questions"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


 // ==========================================
// UPDATE QUIZ QUESTIONS AND OPTIONS
// ==========================================
const updateQuizQuestions = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const quizId = Number(req.params.quizId);
        const { questions } = req.body;

        // Validate quiz ID
        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                message: "Valid quiz ID is required"
            });
        }

        // Exactly 3 questions required
        if (!Array.isArray(questions) || questions.length !== 3) {
            return res.status(400).json({
                message: "Exactly 3 questions are required"
            });
        }

        // Validate questions and options
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];

            if (
                !question ||
                typeof question.question_text !== "string" ||
                !question.question_text.trim()
            ) {
                return res.status(400).json({
                    message: `Question ${i + 1} is required`
                });
            }

            if (
                question.explanation !== undefined &&
                question.explanation !== null &&
                typeof question.explanation !== "string"
            ) {
                return res.status(400).json({
                    message: `Invalid explanation for question ${i + 1}`
                });
            }

            if (
                !Array.isArray(question.options) ||
                question.options.length !== 4
            ) {
                return res.status(400).json({
                    message: `Question ${i + 1} must have exactly 4 options`
                });
            }

            for (const option of question.options) {
                if (
                    !option ||
                    typeof option.option_text !== "string" ||
                    !option.option_text.trim() ||
                    option.option_text.trim().length > 500 ||
                    typeof option.is_correct !== "boolean"
                ) {
                    return res.status(400).json({
                        message: `Invalid option in question ${i + 1}`
                    });
                }
            }

            const correctCount = question.options.filter(
                option => option.is_correct === true
            ).length;

            if (correctCount !== 1) {
                return res.status(400).json({
                    message: `Question ${i + 1} must have exactly one correct option`
                });
            }
        }

        // Get database connection
        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        // Lock quiz
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

        if (quizzes[0].status !== "draft") {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "Only draft quiz questions can be edited"
            });
        }

        // Protect existing student attempts
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
                message: "Questions cannot be edited because student attempts exist"
            });
        }

        // Delete existing questions.
        // Their options are deleted through ON DELETE CASCADE.
        await connection.query(
            `DELETE FROM daily_quiz_questions
             WHERE daily_quiz_id = ?`,
            [quizId]
        );

        // Insert replacement questions and options
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];

            const [questionResult] = await connection.query(
                `INSERT INTO daily_quiz_questions
                    (
                        daily_quiz_id,
                        question_text,
                        explanation,
                        question_order
                    )
                 VALUES (?, ?, ?, ?)`,
                [
                    quizId,
                    question.question_text.trim(),
                    question.explanation?.trim() || null,
                    i + 1
                ]
            );

            const questionId = questionResult.insertId;

            for (let j = 0; j < question.options.length; j++) {
                const option = question.options[j];

                await connection.query(
                    `INSERT INTO daily_quiz_options
                        (
                            question_id,
                            option_text,
                            is_correct,
                            option_order
                        )
                     VALUES (?, ?, ?, ?)`,
                    [
                        questionId,
                        option.option_text.trim(),
                        option.is_correct ? 1 : 0,
                        j + 1
                    ]
                );
            }
        }

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            message: "Quiz questions and options updated successfully",
            quiz_id: quizId,
            total_questions: 3,
            options_per_question: 4
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
            transactionStarted = false;
        }

        console.error("Update quiz questions error:", error);

        return res.status(500).json({
            message: "Failed to update quiz questions"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


module.exports = {
    addQuizQuestions,
    updateQuizQuestions
};