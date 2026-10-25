
const db = require("../../../config/db");

// ==========================================
// UPDATE EXISTING QUIZ QUESTIONS
// ==========================================
const updateQuizQuestions = async (req, res) => {
    let connection;

    try {
        const quizId = Number(req.params.quizId);
        const { questions } = req.body;

        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                message: "Invalid quiz ID"
            });
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                message: "At least one question is required"
            });
        }

        // Validate request data before opening a transaction.
        const questionIds = [];

        for (const question of questions) {
            if (
                !question ||
                typeof question !== "object" ||
                Array.isArray(question)
            ) {
                return res.status(400).json({
                    message: "Invalid question data"
                });
            }

            const questionId = Number(question.id);

            if (!Number.isInteger(questionId) || questionId <= 0) {
                return res.status(400).json({
                    message: "Only existing question IDs can be updated"
                });
            }

            questionIds.push(questionId);

            if (
                typeof question.question_text !== "string" ||
                !question.question_text.trim()
            ) {
                return res.status(400).json({
                    message: "Question text is required"
                });
            }

            if (
                !Number.isFinite(Number(question.marks)) ||
                Number(question.marks) <= 0
            ) {
                return res.status(400).json({
                    message: "Question marks must be greater than zero"
                });
            }

            if (
                question.explanation != null &&
                typeof question.explanation !== "string"
            ) {
                return res.status(400).json({
                    message: "Invalid explanation"
                });
            }

            if (
                question.concept_tag != null &&
                typeof question.concept_tag !== "string"
            ) {
                return res.status(400).json({
                    message: "Invalid concept tag"
                });
            }

            if (
                typeof question.concept_tag === "string" &&
                question.concept_tag.trim().length > 150
            ) {
                return res.status(400).json({
                    message: "Concept tag cannot exceed 150 characters"
                });
            }
        }

        if (new Set(questionIds).size !== questionIds.length) {
            return res.status(400).json({
                message: "Duplicate question IDs are not allowed"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Verify that the mentor owns this quiz.
        const [quizzes] = await connection.query(
            `SELECT id
             FROM advanced_theory_quizzes
             WHERE id = ? AND mentor_id = ?
             FOR UPDATE`,
            [quizId, req.user.id]
        );

        if (quizzes.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Quiz not found or you do not own it"
            });
        }

        // Prevent changing questions after any student has attempted this quiz.
const [attempts] = await connection.query(
    `SELECT id
     FROM advanced_theory_attempts
     WHERE quiz_id = ?
     LIMIT 1`,
    [quizId]
);

if (attempts.length > 0) {
    await connection.rollback();

    return res.status(409).json({
        message:
            "Questions cannot be edited because students have already attempted this quiz."
    });
}

        // Verify that every submitted question belongs to this quiz.
        const placeholders = questionIds.map(() => "?").join(", ");

        const [existingQuestions] = await connection.query(
            `SELECT id
             FROM advanced_theory_questions
             WHERE quiz_id = ?
               AND id IN (${placeholders})
             FOR UPDATE`,
            [quizId, ...questionIds]
        );

        const existingIds = new Set(
            existingQuestions.map(question => Number(question.id))
        );

        if (questionIds.some(id => !existingIds.has(id))) {
            await connection.rollback();

            return res.status(400).json({
                message: "One or more questions do not belong to this quiz"
            });
        }

        // Update question details without changing question or option IDs.
        for (let index = 0; index < questions.length; index++) {
            const question = questions[index];

            await connection.query(
                `UPDATE advanced_theory_questions
                 SET question_text = ?,
                     explanation = ?,
                     concept_tag = ?,
                     marks = ?,
                     display_order = ?
                 WHERE id = ? AND quiz_id = ?`,
                [
                    question.question_text.trim(),
                    typeof question.explanation === "string"
                        ? question.explanation.trim() || null
                        : null,
                    typeof question.concept_tag === "string"
                        ? question.concept_tag.trim() || null
                        : null,
                    Number(question.marks),
                    index + 1,
                    Number(question.id),
                    quizId
                ]
            );
        }

        await connection.commit();

        return res.status(200).json({
            message: "Quiz questions updated successfully",
            quizId,
            updatedCount: questions.length
        });

    } catch (error) {
        if (connection) {
            await connection.rollback().catch(() => {});
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


const updateQuestionOptions = async (req, res) => {
    let connection;

    try {
        const quizId = Number(req.params.quizId);
        const questionId = Number(req.params.questionId);
        const { options } = req.body;

        if (
            !Number.isInteger(quizId) ||
            quizId <= 0 ||
            !Number.isInteger(questionId) ||
            questionId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid quiz or question ID"
            });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                message: "At least two options are required"
            });
        }

        // Validate options before changing the database.
        const optionIds = [];
        let correctCount = 0;

        for (const option of options) {
            if (
                !option ||
                typeof option !== "object" ||
                Array.isArray(option)
            ) {
                return res.status(400).json({
                    message: "Invalid option data"
                });
            }

            if (
                typeof option.option_text !== "string" ||
                !option.option_text.trim()
            ) {
                return res.status(400).json({
                    message: "Option text is required"
                });
            }

            if (![true, false, 1, 0, "1", "0"].includes(option.is_correct)) {
                return res.status(400).json({
                    message: "Invalid correct-answer value"
                });
            }

            if (
                option.is_correct === true ||
                option.is_correct === 1 ||
                option.is_correct === "1"
            ) {
                correctCount++;
            }

            if (option.id !== undefined && option.id !== null) {
                const optionId = Number(option.id);

                if (!Number.isInteger(optionId) || optionId <= 0) {
                    return res.status(400).json({
                        message: "Invalid option ID"
                    });
                }

                optionIds.push(optionId);
            }
        }

        if (correctCount !== 1) {
            return res.status(400).json({
                message: "Select exactly one correct option"
            });
        }

        if (new Set(optionIds).size !== optionIds.length) {
            return res.status(400).json({
                message: "Duplicate option IDs are not allowed"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Verify mentor ownership through the quiz.
        const [questions] = await connection.query(
            `SELECT q.id
             FROM advanced_theory_questions q
             INNER JOIN advanced_theory_quizzes z
                 ON z.id = q.quiz_id
             WHERE q.id = ?
               AND z.id = ?
               AND z.mentor_id = ?
             FOR UPDATE`,
            [questionId, quizId, req.user.id]
        );

        if (questions.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Question not found or you do not own this quiz"
            });
        }
        
        // Prevent changing options or correct answers after any student
        // has attempted this quiz.
        const [attempts] = await connection.query(
            `SELECT id
             FROM advanced_theory_attempts
             WHERE quiz_id = ?
             LIMIT 1`,
            [quizId]
        );

        if (attempts.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                message:
                    "Options cannot be edited because students have already attempted this quiz."
            });
        }


        // Retrieve current option IDs.
        const [existingOptions] = await connection.query(
            `SELECT id
             FROM advanced_theory_options
             WHERE question_id = ?
             FOR UPDATE`,
            [questionId]
        );

        const existingIds = new Set(
            existingOptions.map(option => Number(option.id))
        );

        // Reject option IDs that belong to another question.
        if (optionIds.some(id => !existingIds.has(id))) {
            await connection.rollback();

            return res.status(400).json({
                message: "One or more option IDs do not belong to this question"
            });
        }

        // Update existing options; insert new options when no ID is supplied.
        for (let index = 0; index < options.length; index++) {
            const option = options[index];

            const isCorrect =
                option.is_correct === true ||
                option.is_correct === 1 ||
                option.is_correct === "1";

            if (option.id !== undefined && option.id !== null) {
                await connection.query(
                    `UPDATE advanced_theory_options
                     SET option_text = ?,
                         is_correct = ?,
                         display_order = ?
                     WHERE id = ? AND question_id = ?`,
                    [
                        option.option_text.trim(),
                        isCorrect ? 1 : 0,
                        index + 1,
                        Number(option.id),
                        questionId
                    ]
                );
            } else {
                await connection.query(
                    `INSERT INTO advanced_theory_options
                        (
                            question_id,
                            option_text,
                            is_correct,
                            display_order
                        )
                     VALUES (?, ?, ?, ?)`,
                    [
                        questionId,
                        option.option_text.trim(),
                        isCorrect ? 1 : 0,
                        index + 1
                    ]
                );
            }
        }

        await connection.commit();

        return res.status(200).json({
            message: "Question options updated successfully",
            quizId,
            questionId,
            optionCount: options.length
        });

    } catch (error) {
        if (connection) {
            await connection.rollback().catch(() => {});
        }

        console.error("Update question options error:", error);

        return res.status(500).json({
            message: "Failed to update question options"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


const deleteQuizQuestion = async (req, res) => {
    let connection;

    try {
        const quizId = Number(req.params.quizId);
        const questionId = Number(req.params.questionId);
        const mentorId = req.user.id;

        if (
            !Number.isInteger(quizId) || quizId <= 0 ||
            !Number.isInteger(questionId) || questionId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid quiz or question ID."
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Verify quiz ownership and lock the quiz.
        const [quizzes] = await connection.query(
            `SELECT id
             FROM advanced_theory_quizzes
             WHERE id = ? AND mentor_id = ?
             FOR UPDATE`,
            [quizId, mentorId]
        );

        if (quizzes.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Quiz not found or you do not own it."
            });
        }

        // 2. Verify the question belongs to this quiz.
        const [questions] = await connection.query(
            `SELECT id
             FROM advanced_theory_questions
             WHERE id = ? AND quiz_id = ?
             FOR UPDATE`,
            [questionId, quizId]
        );

        if (questions.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Question not found in this quiz."
            });
        }

        // 3. Protect student attempts and answer history.
        // Safest initial rule: don't delete questions from a quiz
        // that students have already attempted.
        const [attempts] = await connection.query(
            `SELECT id
             FROM advanced_theory_attempts
             WHERE quiz_id = ?
             LIMIT 1`,
            [quizId]
        );

        if (attempts.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                message:
                    "This question cannot be deleted because students have attempted this quiz."
            });
        }

        // 4. Delete only this question's options.
        await connection.query(
            `DELETE FROM advanced_theory_options
             WHERE question_id = ?`,
            [questionId]
        );

        // 5. Delete only the selected question.
        await connection.query(
            `DELETE FROM advanced_theory_questions
             WHERE id = ? AND quiz_id = ?`,
            [questionId, quizId]
        );

        // 6. Keep the remaining questions in display order.
        const [remainingQuestions] = await connection.query(
            `SELECT id
             FROM advanced_theory_questions
             WHERE quiz_id = ?
             ORDER BY display_order ASC, id ASC
             FOR UPDATE`,
            [quizId]
        );

        for (let index = 0; index < remainingQuestions.length; index++) {
            await connection.query(
                `UPDATE advanced_theory_questions
                 SET display_order = ?
                 WHERE id = ? AND quiz_id = ?`,
                [index + 1, remainingQuestions[index].id, quizId]
            );
        }

        await connection.commit();

        return res.status(200).json({
            message: "Question deleted successfully.",
            quizId,
            deletedQuestionId: questionId,
            remainingCount: remainingQuestions.length
        });

    } catch (error) {
        if (connection) {
            await connection.rollback().catch(() => {});
        }

        console.error("Delete theory question error:", error);

        return res.status(500).json({
            message: "Failed to delete question."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


const createQuizQuestion = async (req, res) => {
    let connection;

    try {
        const quizId = Number(req.params.quizId);
        const {
            question_text,
            explanation,
            concept_tag,
            marks,
            options
        } = req.body;

        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                message: "Invalid quiz ID"
            });
        }

        if (
            typeof question_text !== "string" ||
            !question_text.trim()
        ) {
            return res.status(400).json({
                message: "Question text is required"
            });
        }

        if (
            !Number.isFinite(Number(marks)) ||
            Number(marks) <= 0
        ) {
            return res.status(400).json({
                message: "Question marks must be greater than zero"
            });
        }

        if (
            explanation != null &&
            typeof explanation !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid explanation"
            });
        }

        if (
            concept_tag != null &&
            typeof concept_tag !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid concept tag"
            });
        }

        if (
            typeof concept_tag === "string" &&
            concept_tag.trim().length > 150
        ) {
            return res.status(400).json({
                message: "Concept tag cannot exceed 150 characters"
            });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                message: "At least two options are required"
            });
        }

        let correctCount = 0;

        for (const option of options) {
            if (
                !option ||
                typeof option.option_text !== "string" ||
                !option.option_text.trim()
            ) {
                return res.status(400).json({
                    message: "Every option must have text"
                });
            }

            if (
                ![true, false, 1, 0, "1", "0"].includes(
                    option.is_correct
                )
            ) {
                return res.status(400).json({
                    message: "Invalid correct-answer value"
                });
            }

            if (
                option.is_correct === true ||
                option.is_correct === 1 ||
                option.is_correct === "1"
            ) {
                correctCount++;
            }
        }

        if (correctCount !== 1) {
            return res.status(400).json({
                message: "Select exactly one correct option"
            });
        }

        // Normalize whitespace and capitalization for duplicate checks.
        const normalizeQuestion = value =>
            value.trim().replace(/\s+/g, " ").toLowerCase();

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Lock and verify the quiz belongs to this mentor.
        const [quizzes] = await connection.query(
            `SELECT id
             FROM advanced_theory_quizzes
             WHERE id = ? AND mentor_id = ?
             FOR UPDATE`,
            [quizId, req.user.id]
        );

        if (quizzes.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Quiz not found or you do not own it"
            });
        }

        // Check duplicate question text within this quiz.
        const [existingQuestions] = await connection.query(
            `SELECT question_text
             FROM advanced_theory_questions
             WHERE quiz_id = ?
             FOR UPDATE`,
            [quizId]
        );

        const normalizedText = normalizeQuestion(question_text);

        const duplicate = existingQuestions.some(
            question =>
                normalizeQuestion(question.question_text) === normalizedText
        );

        if (duplicate) {
            await connection.rollback();

            return res.status(409).json({
                message: "This question already exists in the quiz"
            });
        }

        // Add the new question at the end.
        const [lastQuestions] = await connection.query(
            `SELECT COALESCE(MAX(display_order), 0) AS lastOrder
             FROM advanced_theory_questions
             WHERE quiz_id = ?`,
            [quizId]
        );

        const displayOrder = Number(lastQuestions[0].lastOrder) + 1;

        const [result] = await connection.query(
            `INSERT INTO advanced_theory_questions
                (
                    quiz_id,
                    question_text,
                    explanation,
                    concept_tag,
                    marks,
                    display_order,
                    status
                )
             VALUES (?, ?, ?, ?, ?, ?, 'active')`,
            [
                quizId,
                question_text.trim(),
                typeof explanation === "string"
                    ? explanation.trim() || null
                    : null,
                typeof concept_tag === "string"
                    ? concept_tag.trim() || null
                    : null,
                Number(marks),
                displayOrder
            ]
        );

        const questionId = result.insertId;

        for (let index = 0; index < options.length; index++) {
            const option = options[index];

            const isCorrect =
                option.is_correct === true ||
                option.is_correct === 1 ||
                option.is_correct === "1";

            await connection.query(
                `INSERT INTO advanced_theory_options
                    (
                        question_id,
                        option_text,
                        is_correct,
                        display_order
                    )
                 VALUES (?, ?, ?, ?)`,
                [
                    questionId,
                    option.option_text.trim(),
                    isCorrect ? 1 : 0,
                    index + 1
                ]
            );
        }

        await connection.commit();

        return res.status(201).json({
            message: "Question added successfully",
            quizId,
            questionId,
            display_order: displayOrder
        });

    } catch (error) {
        if (connection) {
            await connection.rollback().catch(() => {});
        }

        console.error("Create theory quiz question error:", error);

        return res.status(500).json({
            message: "Failed to add question"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


module.exports = {
    createQuizQuestion,
    updateQuizQuestions,
    updateQuestionOptions,
    deleteQuizQuestion
};
