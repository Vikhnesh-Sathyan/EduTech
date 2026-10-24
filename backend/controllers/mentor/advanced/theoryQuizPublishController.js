const db = require("../../../config/db");

const publishQuiz = async (req, res) => {
    const quizId = Number(req.params.quizId);
    const mentorId = req.user.id;

    if (!Number.isInteger(quizId) || quizId <= 0) {
        return res.status(400).json({
            message: "Invalid quiz ID"
        });
    }

    try {
        // 1. Check quiz ownership and current status
        const [quizzes] = await db.query(
            `SELECT id, status
             FROM advanced_theory_quizzes
             WHERE id = ? AND mentor_id = ?`,
            [quizId, mentorId]
        );

        if (quizzes.length === 0) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        const quiz = quizzes[0];

        if (quiz.status === "published") {
            return res.status(400).json({
                message: "Quiz is already published"
            });
        }

        if (quiz.status !== "draft") {
            return res.status(400).json({
                message: "Only draft quizzes can be published"
            });
        }

        // 2. Check that the quiz has active questions
        const [questions] = await db.query(
            `SELECT id, question_text, marks
             FROM advanced_theory_questions
             WHERE quiz_id = ? AND status = 'active'`,
            [quizId]
        );

        if (questions.length === 0) {
            return res.status(400).json({
                message: "Add at least one active question before publishing"
            });
        }

        // 3. Validate each question and its options
        for (const question of questions) {
            if (!question.question_text?.trim()) {
                return res.status(400).json({
                    message: `Question ${question.id} has no question text`
                });
            }

            if (Number(question.marks) <= 0) {
                return res.status(400).json({
                    message: `Question ${question.id} must have positive marks`
                });
            }

            const [options] = await db.query(
                `SELECT option_text, is_correct
                 FROM advanced_theory_options
                 WHERE question_id = ?`,
                [question.id]
            );

            if (options.length < 2) {
                return res.status(400).json({
                    message: `Question ${question.id} must have at least two options`
                });
            }

            if (options.some(option => !option.option_text?.trim())) {
                return res.status(400).json({
                    message: `Question ${question.id} has an empty option`
                });
            }

            const correctCount = options.filter(
                option => Number(option.is_correct) === 1
            ).length;

            if (correctCount !== 1) {
                return res.status(400).json({
                    message: `Question ${question.id} must have exactly one correct option`
                });
            }
        }

        // 4. Publish the quiz
        await db.query(
            `UPDATE advanced_theory_quizzes
             SET status = 'published'
             WHERE id = ? AND mentor_id = ? AND status = 'draft'`,
            [quizId, mentorId]
        );

        return res.status(200).json({
            message: "Quiz published successfully",
            status: "published"
        });

    } catch (error) {
        console.error("Publish theory quiz error:", error);

        return res.status(500).json({
            message: "Failed to publish quiz"
        });
    }
};

module.exports = {
    publishQuiz
};