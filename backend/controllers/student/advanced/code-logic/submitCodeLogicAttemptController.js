
const db = require("../../../../config/db");

// =====================================================
// SUBMIT A LOGIC TO CODE ATTEMPT
// =====================================================

const submitCodeLogicAttempt = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const studentId = Number(req.user?.id);
        const problemId = Number(req.params.problemId);

        const {
            submittedAnswer,
            predictedOutput
        } = req.body;

        // ---------------------------------------------
        // 1. VALIDATE REQUEST
        // ---------------------------------------------

        if (
            !Number.isInteger(studentId) ||
            studentId <= 0 ||
            !Number.isInteger(problemId) ||
            problemId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid student or problem ID."
            });
        }

        if (
            typeof submittedAnswer !== "string" ||
            !submittedAnswer.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide your submitted answer."
            });
        }

        if (!Array.isArray(predictedOutput)) {
            return res.status(400).json({
                success: false,
                message: "Predicted output must be an array."
            });
        }

        // ---------------------------------------------
        // 2. START TRANSACTION
        // ---------------------------------------------

        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        // ---------------------------------------------
        // 3. GET AVAILABLE PROBLEM
        // ---------------------------------------------

        const [problems] = await connection.execute(
            `SELECT
                id,
                mode,
                max_marks
             FROM code_logic_problems
             WHERE id = ?
               AND status = 'published'
               AND (
                    publish_date IS NULL
                    OR publish_date <= CURDATE()
               )
               AND (
                    due_date IS NULL
                    OR due_date >= NOW()
               )
             FOR UPDATE`,
            [problemId]
        );

        if (problems.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Problem not found or no longer available."
            });
        }

        const problem = problems[0];

        // ---------------------------------------------
        // 4. BUILD_CODE NEEDS A SEPARATE EVALUATOR
        // ---------------------------------------------

        if (problem.mode !== "understand_code") {
            await connection.rollback();
            transactionStarted = false;

            return res.status(501).json({
                success: false,
                message:
                    "Automatic evaluation for build-code problems is not implemented yet."
            });
        }

        // ---------------------------------------------
        // 5. GET THE STUDENT'S ACTIVE ATTEMPT
        // ---------------------------------------------

        const [attempts] = await connection.execute(
            `SELECT
                id,
                hints_used,
                started_at
             FROM code_logic_attempts
             WHERE student_id = ?
               AND problem_id = ?
               AND status = 'in_progress'
             ORDER BY attempt_number DESC
             LIMIT 1
             FOR UPDATE`,
            [studentId, problemId]
        );

        if (attempts.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(409).json({
                success: false,
                message: "Start an attempt before submitting."
            });
        }

        const attempt = attempts[0];

        // ---------------------------------------------
        // 6. LOAD EXPECTED ANSWERS FROM DATABASE
        // ---------------------------------------------

        const [contentRows] = await connection.execute(
            `SELECT prediction_questions
             FROM code_logic_problem_content
             WHERE problem_id = ?`,
            [problemId]
        );

        if (contentRows.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(422).json({
                success: false,
                message: "Prediction questions have not been configured."
            });
        }

        let questions = contentRows[0].prediction_questions;

        if (typeof questions === "string") {
            try {
                questions = JSON.parse(questions);
            } catch {
                questions = null;
            }
        }

        if (
            !Array.isArray(questions) ||
            questions.length === 0 ||
            questions.some(question =>
                !question ||
                typeof question.question !== "string" ||
                typeof question.expected_answer !== "string" ||
                !Number.isFinite(Number(question.marks)) ||
                Number(question.marks) < 0
            )
        ) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(422).json({
                success: false,
                message: "Prediction question configuration is invalid."
            });
        }

        // ---------------------------------------------
        // 7. VALIDATE ANSWER INDEXES
        // ---------------------------------------------

        const answersByIndex = new Map();

        for (const item of predictedOutput) {
            if (
                !item ||
                !Number.isInteger(item.questionIndex) ||
                item.questionIndex < 0 ||
                item.questionIndex >= questions.length ||
                typeof item.answer !== "string" ||
                answersByIndex.has(item.questionIndex)
            ) {
                await connection.rollback();
                transactionStarted = false;

                return res.status(400).json({
                    success: false,
                    message: "One or more prediction answers are invalid."
                });
            }

            answersByIndex.set(item.questionIndex, item.answer);
        }

        // ---------------------------------------------
        // 8. EVALUATE PREDICTION ANSWERS
        // ---------------------------------------------

        let score = 0;
        let totalQuestionMarks = 0;
        let correctAnswers = 0;

        const normalizeAnswer = value =>
            String(value).trim().replace(/\s+/g, " ").toLowerCase();

        questions.forEach((question, index) => {
            const marks = Number(question.marks);

            totalQuestionMarks += marks;

            const submitted = answersByIndex.get(index);

            if (
                submitted !== undefined &&
                normalizeAnswer(submitted) ===
                    normalizeAnswer(question.expected_answer)
            ) {
                score += marks;
                correctAnswers++;
            }
        });

        // The question marks must fit within the problem's max_marks.
        const maxMarks = Number(problem.max_marks);

        if (totalQuestionMarks > maxMarks) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(422).json({
                success: false,
                message:
                    "The total prediction-question marks exceed the problem's maximum marks."
            });
        }

        // Keep database decimal values predictable.
        score = Math.round(Math.min(score, maxMarks) * 100) / 100;

        const isCorrect =
            correctAnswers === questions.length &&
            answersByIndex.size === questions.length;

        const attemptStatus = isCorrect ? "completed" : "submitted";

        // ---------------------------------------------
        // 9. SAVE THE EVALUATED ATTEMPT
        // ---------------------------------------------

        await connection.execute(
            `UPDATE code_logic_attempts
             SET submitted_answer = ?,
                 predicted_output = ?,
                 score = ?,
                 max_marks = ?,
                 time_taken_seconds =
                    GREATEST(
                        0,
                        TIMESTAMPDIFF(SECOND, started_at, NOW())
                    ),
                 status = ?,
                 is_correct = ?,
                 submitted_at = NOW()
             WHERE id = ?
               AND student_id = ?
               AND status = 'in_progress'`,
            [
                submittedAnswer.trim(),
                JSON.stringify(predictedOutput),
                score,
                maxMarks,
                attemptStatus,
                isCorrect ? 1 : 0,
                attempt.id,
                studentId
            ]
        );

        // ---------------------------------------------
        // 10. UPDATE STUDENT PROGRESS
        // ---------------------------------------------

        const progressStatus = isCorrect
            ? "completed"
            : "in_progress";

        await connection.execute(
            `INSERT INTO code_logic_progress (
                student_id,
                problem_id,
                status,
                first_score,
                latest_score,
                best_score,
                attempt_count,
                first_attempt_at,
                last_attempt_at,
                completed_at
            )
            VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW(), ?)
            ON DUPLICATE KEY UPDATE
                status = IF(
                    status = 'completed',
                    'completed',
                    VALUES(status)
                ),
                first_score = COALESCE(
                    first_score,
                    VALUES(first_score)
                ),
                latest_score = VALUES(latest_score),
                best_score = GREATEST(
                    COALESCE(best_score, VALUES(best_score)),
                    VALUES(best_score)
                ),
                attempt_count = attempt_count + 1,
                first_attempt_at = COALESCE(
                    first_attempt_at,
                    NOW()
                ),
                last_attempt_at = NOW(),
                completed_at = IF(
                    status = 'completed',
                    COALESCE(completed_at, NOW()),
                    VALUES(completed_at)
                )`,
            [
                studentId,
                problemId,
                progressStatus,
                score,
                score,
                score,
                isCorrect ? new Date() : null
            ]
        );

        // ---------------------------------------------
        // 11. COMMIT
        // ---------------------------------------------

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            success: true,
            message: isCorrect
                ? "Excellent! All prediction answers are correct."
                : "Attempt submitted. You can try again.",
            result: {
                attemptId: attempt.id,
                problemId,
                score,
                maxMarks,
                correctAnswers,
                totalQuestions: questions.length,
                hintsUsed: attempt.hints_used,
                status: attemptStatus,
                isCorrect
            }
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error(
            "Submit Code Logic Attempt Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to submit the attempt."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    submitCodeLogicAttempt
};
