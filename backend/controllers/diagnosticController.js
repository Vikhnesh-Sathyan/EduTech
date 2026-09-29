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

const submitAnswer = async (req, res) => {

    const studentId = req.user.id;
    const { attemptId } = req.params;
    const { questionId, selectedOption } = req.body;

    // Validate selected option
    if (
        !questionId ||
        !["A", "B", "C", "D"].includes(selectedOption)
    ) {
        return res.status(400).json({
            message: "Question and valid answer are required"
        });
    }

    try {

        // Verify the attempt belongs to this student
        // and get the correct answer for this question
        const questionSql = `
            SELECT
                dq.id,
                dq.correct_option
            FROM diagnostic_questions dq
            INNER JOIN diagnostic_attempts da
                ON da.subject_id = dq.subject_id
            WHERE da.id = ?
              AND da.student_id = ?
              AND dq.id = ?
              AND da.status = 'in_progress'
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

        // Attempt or question is invalid
        if (questionResult.length === 0) {
            return res.status(404).json({
                message: "Invalid diagnostic attempt or question"
            });
        }

        const correctOption =
            questionResult[0].correct_option;

        const isCorrect =
            selectedOption === correctOption;


        // Save the student's answer
        const answerSql = `
            INSERT INTO diagnostic_answers
            (
                attempt_id,
                question_id,
                selected_option,
                is_correct
            )
            VALUES (?, ?, ?, ?)
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

        res.status(201).json({
            message: "Answer saved successfully"
        });

    } catch (error) {

        // Student cannot answer the same question twice
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This question has already been answered"
            });
        }

        console.error(
            "Diagnostic answer submission failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to save answer"
        });
    }
};

module.exports = {
    startDiagnostic,
    getDiagnosticQuestions,
    submitAnswer
};