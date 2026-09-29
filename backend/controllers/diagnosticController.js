const db = require("../config/db");

// ==========================================
// START DIAGNOSTIC
// ==========================================

const startDiagnostic = async (req, res) => {

    // Student ID comes from JWT
    const studentId = req.user.id;

    // Subject ID comes from URL
    const { subjectId } = req.params;

    try {

        // Verify that this subject belongs
        // to the student's education year
        const subjectSql = `
            SELECT
                s.id,
                s.name
            FROM subjects s
            INNER JOIN student_profiles sp
                ON sp.education_year_id = s.education_year_id
            WHERE sp.user_id = ?
              AND s.id = ?
              AND s.status = 'active'
        `;

        const [result] = await db.query(
            subjectSql,
            [studentId, subjectId]
        );

        // Subject does not belong to this student
        if (result.length === 0) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }


        // Select questions before creating the attempt
        const questions = await getDiagnosticQuestions(
            studentId,
            subjectId
        );


        // Create diagnostic attempt
        // only after valid questions are available
        const attemptSql = `
            INSERT INTO diagnostic_attempts
            (student_id, subject_id)
            VALUES (?, ?)
        `;

        const [attemptResult] = await db.query(
            attemptSql,
            [studentId, subjectId]
        );


        res.status(201).json({
            message: "Diagnostic started",
            attemptId: attemptResult.insertId,
            subject: result[0],
            questions
        });

    } catch (error) {

        console.error(
            "Start diagnostic error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ===
                "Not enough diagnostic questions available"
                    ? error.message
                    : "Failed to start diagnostic"
        });
    }
};


// ==========================================
// SELECT DIAGNOSTIC QUESTIONS
// ==========================================

const getDiagnosticQuestions = async (
    studentId,
    subjectId
) => {

  const questionSql = `
    SELECT
        id,
        topic_id,
        question,
        code,
        option_a,
        option_b,
        option_c,
        option_d,
        difficulty
    FROM diagnostic_questions
    WHERE subject_id = ?
      AND status = 'active'
      AND id NOT IN (
          SELECT da.question_id
          FROM diagnostic_answers da
          INNER JOIN diagnostic_attempts d
              ON d.id = da.attempt_id
          WHERE d.student_id = ?
            AND d.subject_id = ?
      )
    ORDER BY RAND()
`;

    const [results] = await db.query(
        questionSql,
        [subjectId, studentId, subjectId]
    );


    // Separate questions by difficulty
    const easy = results.filter(
        question => question.difficulty === "easy"
    );

    const medium = results.filter(
        question => question.difficulty === "medium"
    );

    const hard = results.filter(
        question => question.difficulty === "hard"
    );


    // Check whether enough questions exist
    if (
        easy.length < 5 ||
        medium.length < 4 ||
        hard.length < 1
    ) {
        throw new Error(
            "Not enough diagnostic questions available"
        );
    }


    // ==========================================
    // SELECT QUESTIONS WITH TOPIC COVERAGE
    // ==========================================

    const selectByTopic = (questions, count) => {

        const selected = [];
        const usedTopics = new Set();


        // First pass:
        // Prefer different topics
        for (const question of questions) {

            if (!usedTopics.has(question.topic_id)) {

                selected.push(question);
                usedTopics.add(question.topic_id);

                if (selected.length === count) {
                    return selected;
                }
            }
        }


        // Second pass:
        // Fill remaining slots when necessary
        for (const question of questions) {

            if (!selected.includes(question)) {

                selected.push(question);

                if (selected.length === count) {
                    break;
                }
            }
        }

        return selected;
    };


    // Select required difficulty
    // while trying to cover different topics
    const selectedEasy = selectByTopic(
        easy,
        5
    );

    const selectedMedium = selectByTopic(
        medium,
        4
    );

    const selectedHard = selectByTopic(
        hard,
        1
    );


    return [
        ...selectedEasy,
        ...selectedMedium,
        ...selectedHard
    ];
};

// ==========================================
// SUBMIT DIAGNOSTIC ANSWER
// ==========================================
// ==========================================
// SUBMIT DIAGNOSTIC ANSWER
// ==========================================

const submitAnswer = async (req, res) => {

    const studentId = req.user.id;
    const { attemptId } = req.params;
    const { questionId, selectedOption } = req.body;

    // Validate request data
    if (
        !questionId ||
        !["A", "B", "C", "D"].includes(selectedOption)
    ) {
        return res.status(400).json({
            message: "Question and valid answer are required"
        });
    }

    try {

        // ==========================================
        // CHECK ATTEMPT + QUESTION
        // ==========================================

        const questionSql = `
            SELECT
                dq.id,
                dq.correct_option
            FROM diagnostic_attempts da
            INNER JOIN diagnostic_questions dq
                ON dq.subject_id = da.subject_id
            WHERE da.id = ?
              AND da.student_id = ?
              AND da.status = 'in_progress'
              AND dq.id = ?
              AND dq.status = 'active'
        `;

        const [questionResult] = await db.query(
            questionSql,
            [
                attemptId,
                studentId,
                questionId
            ]
        );

        if (questionResult.length === 0) {
            return res.status(404).json({
                message:
                    "Invalid diagnostic attempt or question"
            });
        }

        // ==========================================
        // CHECK CORRECT ANSWER
        // ==========================================

        const correctOption =
            questionResult[0].correct_option;

        const isCorrect =
            selectedOption === correctOption;


        // ==========================================
        // SAVE OR UPDATE ANSWER
        // ==========================================

        const answerSql = `
            INSERT INTO diagnostic_answers
            (
                attempt_id,
                question_id,
                selected_option,
                is_correct
            )
            VALUES (?, ?, ?, ?)

            ON DUPLICATE KEY UPDATE
                selected_option = VALUES(selected_option),
                is_correct = VALUES(is_correct),
                answered_at = CURRENT_TIMESTAMP
        `;

        await db.query(
            answerSql,
            [
                attemptId,
                questionId,
                selectedOption,
                isCorrect
            ]
        );


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            message: "Answer saved successfully"
        });

    } catch (error) {

        console.error(
            "Diagnostic answer submission failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to save answer"
        });
    }
};
// ==========================================
// COMPLETE DIAGNOSTIC
// ==========================================

const completeDiagnostic = async (req, res) => {

    const studentId = req.user.id;
    const { attemptId } = req.params;

    try {

        // ==========================================
        // CHECK DIAGNOSTIC ATTEMPT
        // ==========================================

        const attemptSql = `
            SELECT
                id,
                subject_id,
                status
            FROM diagnostic_attempts
            WHERE id = ?
              AND student_id = ?
        `;

        const [attemptResult] = await db.query(
            attemptSql,
            [attemptId, studentId]
        );

        if (attemptResult.length === 0) {
            return res.status(404).json({
                message: "Diagnostic attempt not found"
            });
        }

        const attempt = attemptResult[0];

        // Prevent completing an already completed attempt
        if (attempt.status !== "in_progress") {
            return res.status(400).json({
                message: "Diagnostic is not in progress"
            });
        }


        // ==========================================
        // GET SAVED ANSWERS
        // ==========================================

        const answersSql = `
            SELECT
                da.question_id,
                da.is_correct,
                dq.topic_id,
                st.name AS topic_name,
                dq.difficulty
            FROM diagnostic_answers da

            INNER JOIN diagnostic_questions dq
                ON dq.id = da.question_id

            INNER JOIN subject_topics st
                ON st.id = dq.topic_id

            WHERE da.attempt_id = ?
        `;

        const [answers] = await db.query(
            answersSql,
            [attemptId]
        );


        // ==========================================
        // CHECK ANSWERS
        // ==========================================

        if (answers.length === 0) {
            return res.status(400).json({
                message: "No answers found"
            });
        }


        // The diagnostic currently contains
        // exactly 10 questions.

        if (answers.length < 10) {
            return res.status(400).json({
                message:
                    `Please answer all questions before completing the diagnostic. ${answers.length}/10 answered.`
            });
        }


        // ==========================================
        // OVERALL SCORE
        // ==========================================

        const answeredQuestions =
            answers.length;

        const correctAnswers =
            answers.filter(
                answer => answer.is_correct
            ).length;

        const incorrectAnswers =
            answeredQuestions -
            correctAnswers;

        const percentage =
            (
                correctAnswers /
                answeredQuestions
            ) * 100;


        // ==========================================
        // DIFFICULTY-WISE RESULTS
        // ==========================================

        const difficultyResults = {

            easy: {
                totalQuestions: 0,
                correctAnswers: 0
            },

            medium: {
                totalQuestions: 0,
                correctAnswers: 0
            },

            hard: {
                totalQuestions: 0,
                correctAnswers: 0
            }

        };


        for (const answer of answers) {

            const difficulty =
                answer.difficulty;

            if (!difficultyResults[difficulty]) {
                continue;
            }

            difficultyResults[difficulty]
                .totalQuestions++;

            if (answer.is_correct) {

                difficultyResults[difficulty]
                    .correctAnswers++;
            }
        }


        // Convert difficulty object
        // into frontend-friendly array.

        const difficultyBreakdown =
            Object.entries(
                difficultyResults
            ).map(([difficulty, result]) => {

                const difficultyPercentage =
                    result.totalQuestions > 0
                        ? (
                            result.correctAnswers /
                            result.totalQuestions
                        ) * 100
                        : 0;

                return {
                    difficulty,
                    totalQuestions:
                        result.totalQuestions,
                    correctAnswers:
                        result.correctAnswers,
                    incorrectAnswers:
                        result.totalQuestions -
                        result.correctAnswers,
                    percentage:
                        Number(
                            difficultyPercentage.toFixed(2)
                        )
                };
            });


        // ==========================================
        // TOPIC-WISE RESULTS
        // ==========================================

        const topicResults = {};


        for (const answer of answers) {

            const topicId =
                answer.topic_id;


            if (!topicResults[topicId]) {

                topicResults[topicId] = {

                    topicName:
                        answer.topic_name,

                    totalQuestions: 0,

                    correctAnswers: 0

                };
            }


            topicResults[topicId]
                .totalQuestions++;


            if (answer.is_correct) {

                topicResults[topicId]
                    .correctAnswers++;
            }
        }


        // ==========================================
        // SAVE + PREPARE TOPIC RESULTS
        // ==========================================

        const topicBreakdown = [];


        for (const topicId in topicResults) {

            const result =
                topicResults[topicId];


            const topicPercentage =
                (
                    result.correctAnswers /
                    result.totalQuestions
                ) * 100;


            // ======================================
            // INITIAL SIGNAL
            // ======================================

            let signal;

            let level;


            if (topicPercentage === 100) {

                signal = "Comfortable";
                level = "strong";

            }
            else if (topicPercentage >= 50) {

                signal = "Developing";
                level = "developing";

            }
            else if (topicPercentage > 0) {

                signal = "Needs practice";
                level = "beginner";

            }
            else {

                signal = "Needs focused practice";
                level = "beginner";
            }


            // ======================================
            // SAVE TOPIC RESULT
            // ======================================

            const topicResultSql = `
                INSERT INTO diagnostic_topic_results
                (
                    attempt_id,
                    topic_id,
                    total_questions,
                    correct_answers,
                    percentage,
                    level
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;


            await db.query(
                topicResultSql,
                [
                    attemptId,
                    topicId,
                    result.totalQuestions,
                    result.correctAnswers,
                    topicPercentage,
                    level
                ]
            );


            // ======================================
            // PREPARE FRONTEND RESULT
            // ======================================

            topicBreakdown.push({

                topicId:
                    Number(topicId),

                topicName:
                    result.topicName,

                totalQuestions:
                    result.totalQuestions,

                correctAnswers:
                    result.correctAnswers,

                incorrectAnswers:
                    result.totalQuestions -
                    result.correctAnswers,

                percentage:
                    Number(
                        topicPercentage.toFixed(2)
                    ),

                signal

            });
        }


        // ==========================================
        // RECOMMENDED FOCUS
        // ==========================================

        const recommendedTopics =
            topicBreakdown
                .filter(topic =>
                    topic.signal === "Needs practice" ||
                    topic.signal === "Needs focused practice"
                )
                .sort(
                    (a, b) =>
                        a.percentage -
                        b.percentage
                )
                .map(topic => ({
                    topicId:
                        topic.topicId,

                    topicName:
                        topic.topicName,

                    percentage:
                        topic.percentage,

                    signal:
                        topic.signal
                }));


        // ==========================================
        // MARK ATTEMPT AS COMPLETED
        // ==========================================

        const completeSql = `
            UPDATE diagnostic_attempts
            SET
                status = 'completed',
                completed_at = CURRENT_TIMESTAMP
            WHERE id = ?
              AND student_id = ?
              AND status = 'in_progress'
        `;


        await db.query(
            completeSql,
            [
                attemptId,
                studentId
            ]
        );


        // ==========================================
        // SEND COMPLETE RESULT
        // ==========================================

        return res.status(200).json({

            message:
                "Diagnostic completed successfully",

            result: {

                attemptId,

                totalQuestions:
                    answeredQuestions,

                correctAnswers,

                incorrectAnswers,

                percentage:
                    Number(
                        percentage.toFixed(2)
                    ),

                difficultyBreakdown,

                topicBreakdown,

                recommendedTopics

            }

        });


    } catch (error) {

        console.error(
            "Complete diagnostic error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to complete diagnostic"
        });
    }
};

// ==========================================
// GET LATEST COMPLETED DIAGNOSTIC RESULT
// ==========================================

const getDiagnosticResult = async (req, res) => {
    const studentId = req.user.id;
    const { subjectId } = req.params;

    try {

        // Find the latest completed diagnostic attempt
        const attemptSql = `
            SELECT
                da.id,
                da.subject_id,
                s.name AS subject_name
            FROM diagnostic_attempts da
            INNER JOIN subjects s
                ON s.id = da.subject_id
            WHERE da.student_id = ?
              AND da.subject_id = ?
              AND da.status = 'completed'
            ORDER BY da.completed_at DESC
            LIMIT 1
        `;

        const [attemptResult] = await db.query(
            attemptSql,
            [studentId, subjectId]
        );

        // No completed diagnostic exists
        if (attemptResult.length === 0) {
            return res.status(404).json({
                message: "Diagnostic not completed"
            });
        }

        const attempt = attemptResult[0];

        // Get all answers for this attempt
        const answersSql = `
            SELECT
                da.question_id,
                da.selected_option,
                da.is_correct,
                dq.difficulty,
                dq.topic_id,
                st.name AS topic_name
            FROM diagnostic_answers da
            INNER JOIN diagnostic_questions dq
                ON dq.id = da.question_id
            INNER JOIN subject_topics st
                ON st.id = dq.topic_id
            WHERE da.attempt_id = ?
        `;

        const [answers] = await db.query(
            answersSql,
            [attempt.id]
        );

        // Calculate overall result
        const totalQuestions = answers.length;

        const correctAnswers = answers.filter(
            answer => answer.is_correct
        ).length;

        const incorrectAnswers =
            totalQuestions - correctAnswers;

        const percentage =
            totalQuestions > 0
                ? Number(
                    (
                        (correctAnswers / totalQuestions) * 100
                    ).toFixed(2)
                )
                : 0;

        // Difficulty breakdown
        const difficulties = [
            "easy",
            "medium",
            "hard"
        ];

        const difficultyBreakdown =
            difficulties.map(difficulty => {

                const difficultyAnswers =
                    answers.filter(
                        answer =>
                            answer.difficulty === difficulty
                    );

                const total =
                    difficultyAnswers.length;

                const correct =
                    difficultyAnswers.filter(
                        answer => answer.is_correct
                    ).length;

                const difficultyPercentage =
                    total > 0
                        ? Number(
                            (
                                (correct / total) * 100
                            ).toFixed(2)
                        )
                        : 0;

                return {
                    difficulty,
                    totalQuestions: total,
                    correctAnswers: correct,
                    incorrectAnswers: total - correct,
                    percentage: difficultyPercentage
                };
            });

        // Group answers by topic
        const topicMap = {};

        answers.forEach(answer => {

            if (!topicMap[answer.topic_id]) {

                topicMap[answer.topic_id] = {
                    topicId: answer.topic_id,
                    topicName: answer.topic_name,
                    totalQuestions: 0,
                    correctAnswers: 0
                };

            }

            topicMap[answer.topic_id].totalQuestions++;

            if (answer.is_correct) {
                topicMap[answer.topic_id].correctAnswers++;
            }
        });

        // Build topic breakdown
        const topicBreakdown =
            Object.values(topicMap).map(topic => {

                const percentage =
                    Number(
                        (
                            (topic.correctAnswers /
                                topic.totalQuestions) * 100
                        ).toFixed(2)
                    );

                let signal;

                if (percentage === 100) {
                    signal = "Comfortable";
                } else if (percentage >= 50) {
                    signal = "Developing";
                } else if (percentage > 0) {
                    signal = "Needs practice";
                } else {
                    signal = "Needs focused practice";
                }

                return {
                    topicId: topic.topicId,
                    topicName: topic.topicName,
                    totalQuestions: topic.totalQuestions,
                    correctAnswers: topic.correctAnswers,
                    incorrectAnswers:
                        topic.totalQuestions -
                        topic.correctAnswers,
                    percentage,
                    signal
                };
            });

        // Topics that need more practice
        const recommendedTopics =
            topicBreakdown
                .filter(topic =>
                    topic.signal === "Needs practice" ||
                    topic.signal === "Needs focused practice"
                )
                .sort(
                    (a, b) =>
                        a.percentage - b.percentage
                )
                .map(topic => ({
                    topicId: topic.topicId,
                    topicName: topic.topicName,
                    percentage: topic.percentage,
                    signal: topic.signal
                }));

        return res.status(200).json({

            message: "Diagnostic result retrieved successfully",

            result: {
                attemptId: attempt.id,
                subjectId: attempt.subject_id,
                subjectName: attempt.subject_name,

                totalQuestions,
                correctAnswers,
                incorrectAnswers,
                percentage,

                difficultyBreakdown,

                topicBreakdown,

                recommendedTopics
            }

        });

    } catch (error) {

        console.error(
            "Get diagnostic result error:",
            error
        );

        return res.status(500).json({
            message: "Failed to retrieve diagnostic result"
        });
    }
}; 

module.exports = {
    startDiagnostic,
    getDiagnosticQuestions,
    submitAnswer,
    completeDiagnostic,
    getDiagnosticResult
};