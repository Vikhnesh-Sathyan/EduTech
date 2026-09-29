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


        // Create a new diagnostic attempt
        const attemptSql = `
            INSERT INTO diagnostic_attempts
            (student_id, subject_id)
            VALUES (?, ?)
        `;

        const [attemptResult] = await db.query(
            attemptSql,
            [studentId, subjectId]
        );


        // Select questions
        const questions = await getDiagnosticQuestions(
            studentId,
            subjectId
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


        // First pass: choose different topics
        for (const question of questions) {

            if (!usedTopics.has(question.topic_id)) {

                selected.push(question);
                usedTopics.add(question.topic_id);

                if (selected.length === count) {
                    return selected;
                }
            }
        }


        // Second pass: fill remaining slots
        // if there are not enough different topics
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


    // Select required difficulty with topic coverage
    const selectedEasy = selectByTopic(easy, 5);
    const selectedMedium = selectByTopic(medium, 4);
    const selectedHard = selectByTopic(hard, 1);


    return [
        ...selectedEasy,
        ...selectedMedium,
        ...selectedHard
    ];
};


module.exports = {
    startDiagnostic,
    getDiagnosticQuestions
};