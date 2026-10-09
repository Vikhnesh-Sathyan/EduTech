const db = require("../../config/db");

// ======================================================
// GET 5 RANDOM QUESTIONS FOR BASIC CHALLENGE
// ======================================================

const getChallengeQuestions = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const studentId = req.user.id;

    // --------------------------------------------------
    // Validate subtopic ID
    // --------------------------------------------------

    if (
      !subtopicId ||
      !Number.isInteger(Number(subtopicId)) ||
      Number(subtopicId) <= 0
    ) {
      return res.status(400).json({
        message: "A valid subtopic ID is required."
      });
    }

    // --------------------------------------------------
    // Check whether subtopic exists
    // --------------------------------------------------

    const [subtopics] = await db.query(
      `
      SELECT id
      FROM learning_subtopics
      WHERE id = ?
      `,
      [subtopicId]
    );

    if (subtopics.length === 0) {
      return res.status(404).json({
        message: "Subtopic not found."
      });
    }

    // --------------------------------------------------
    // Check whether student has already passed
    // --------------------------------------------------

    const [passedAttempts] = await db.query(
      `
      SELECT id
      FROM basic_challenge_attempts
      WHERE student_id = ?
        AND subtopic_id = ?
        AND passed = TRUE
      LIMIT 1
      `,
      [studentId, subtopicId]
    );

    const challengePassed =
      passedAttempts.length > 0;

    // --------------------------------------------------
    // Require all current sections to be completed
    // only if the student has not passed before.
    //
    // A previous pass must remain valid even when
    // the admin adds new sections later.
    // --------------------------------------------------

    if (!challengePassed) {

      const [sectionProgress] = await db.query(
        `
        SELECT
          COUNT(ls.id) AS total_sections,
          COUNT(
            CASE
              WHEN ssp.status = 'completed'
              THEN 1
            END
          ) AS completed_sections
        FROM learning_sections ls
        LEFT JOIN student_section_progress ssp
          ON ssp.section_id = ls.id
          AND ssp.student_id = ?
        WHERE ls.subtopic_id = ?
        `,
        [studentId, subtopicId]
      );

      const totalSections =
        Number(sectionProgress[0].total_sections);

      const completedSections =
        Number(sectionProgress[0].completed_sections);

      const allSectionsCompleted =
        totalSections > 0 &&
        completedSections === totalSections;

      if (!allSectionsCompleted) {
        return res.status(403).json({
          message:
            "Complete all learning sections before starting the challenge.",
          totalSections,
          completedSections,
          allSectionsCompleted: false
        });
      }
    }

    // --------------------------------------------------
    // Get 5 random questions
    // Never send correct_answer to the student.
    // --------------------------------------------------

    const [questions] = await db.query(
      `
      SELECT
        id,
        question,
        option_a,
        option_b,
        option_c,
        option_d
      FROM basic_challenge_questions
      WHERE subtopic_id = ?
      ORDER BY RAND()
      LIMIT 5
      `,
      [subtopicId]
    );

    // --------------------------------------------------
    // Ensure enough questions are available
    // --------------------------------------------------

    if (questions.length < 5) {
      return res.status(400).json({
        message:
          "Not enough questions available for this challenge."
      });
    }

    // --------------------------------------------------
    // Return questions
    // --------------------------------------------------

    return res.status(200).json({
      message: "Challenge questions loaded successfully.",
      subtopicId: Number(subtopicId),
      totalQuestions: questions.length,
      questions
    });

  } catch (error) {

    console.error(
      "Get challenge questions error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load challenge questions."
    });
  }
};


// ======================================================
// GET BASIC CHALLENGE STATUS
// ======================================================

const getChallengeStatus = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const studentId = req.user.id;

    // --------------------------------------------------
    // Validate subtopic ID
    // --------------------------------------------------

    if (
      !subtopicId ||
      !Number.isInteger(Number(subtopicId)) ||
      Number(subtopicId) <= 0
    ) {
      return res.status(400).json({
        message: "A valid subtopic ID is required."
      });
    }

    // --------------------------------------------------
    // Check whether subtopic exists
    // --------------------------------------------------

    const [subtopics] = await db.query(
      `
      SELECT id
      FROM learning_subtopics
      WHERE id = ?
      `,
      [subtopicId]
    );

    if (subtopics.length === 0) {
      return res.status(404).json({
        message: "Subtopic not found."
      });
    }

    // --------------------------------------------------
    // Get total sections and completed sections
    // --------------------------------------------------

    const [sectionProgress] = await db.query(
      `
      SELECT
        COUNT(ls.id) AS total_sections,
        COUNT(
          CASE
            WHEN ssp.status = 'completed'
            THEN 1
          END
        ) AS completed_sections
      FROM learning_sections ls
      LEFT JOIN student_section_progress ssp
        ON ssp.section_id = ls.id
        AND ssp.student_id = ?
      WHERE ls.subtopic_id = ?
      `,
      [studentId, subtopicId]
    );

    const totalSections =
      Number(sectionProgress[0].total_sections);

    const completedSections =
      Number(sectionProgress[0].completed_sections);

    const allSectionsCompleted =
      totalSections > 0 &&
      completedSections === totalSections;

    // --------------------------------------------------
    // Check whether the student has passed before
    // --------------------------------------------------

    const [passedAttempts] = await db.query(
      `
      SELECT id
      FROM basic_challenge_attempts
      WHERE student_id = ?
        AND subtopic_id = ?
        AND passed = TRUE
      LIMIT 1
      `,
      [studentId, subtopicId]
    );

    const challengePassed =
      passedAttempts.length > 0;

    // --------------------------------------------------
    // Advanced remains unlocked after a pass
    // --------------------------------------------------

    const advancedUnlocked =
      challengePassed;

    // --------------------------------------------------
    // Return status
    // --------------------------------------------------

    return res.status(200).json({
      message: "Challenge status loaded successfully.",
      subtopicId: Number(subtopicId),
      totalSections,
      completedSections,
      allSectionsCompleted,
      challengePassed,
      advancedUnlocked
    });

  } catch (error) {

    console.error(
      "Get challenge status error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load challenge status."
    });
  }
};

// ======================================================
// SUBMIT BASIC CHALLENGE
// ======================================================

const submitChallenge = async (req, res) => {
  let connection;

  try {
    const { subtopicId } = req.params;
    const studentId = req.user.id;
    const { answers } = req.body;

    // --------------------------------------------------
    // Validate subtopic ID
    // --------------------------------------------------

    if (
      !subtopicId ||
      !Number.isInteger(Number(subtopicId)) ||
      Number(subtopicId) <= 0
    ) {
      return res.status(400).json({
        message: "A valid subtopic ID is required."
      });
    }

    // --------------------------------------------------
    // Validate submitted answers
    // --------------------------------------------------

    if (!Array.isArray(answers) || answers.length !== 5) {
      return res.status(400).json({
        message: "Exactly 5 answers are required."
      });
    }

    const validAnswers = answers.every(answer =>
      answer &&
      Number.isInteger(Number(answer.questionId)) &&
      Number(answer.questionId) > 0 &&
      ["A", "B", "C", "D"].includes(answer.selectedAnswer) &&
      ["low", "medium", "high"].includes(answer.confidence)
    );

    if (!validAnswers) {
      return res.status(400).json({
        message: "One or more submitted answers are invalid."
      });
    }

    const questionIds = answers.map(
      answer => Number(answer.questionId)
    );

    if (new Set(questionIds).size !== 5) {
      return res.status(400).json({
        message: "Each challenge question must be unique."
      });
    }

    // --------------------------------------------------
    // Begin database transaction
    // --------------------------------------------------

    connection = await db.getConnection();
    await connection.beginTransaction();

    // --------------------------------------------------
    // Verify subtopic exists
    // --------------------------------------------------

    const [subtopics] = await connection.query(
      `
      SELECT id
      FROM learning_subtopics
      WHERE id = ?
      `,
      [subtopicId]
    );

    if (subtopics.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: "Subtopic not found."
      });
    }

    // --------------------------------------------------
    // Check whether the challenge was already passed
    // --------------------------------------------------

    const [passedAttempts] = await connection.query(
      `
      SELECT id
      FROM basic_challenge_attempts
      WHERE student_id = ?
        AND subtopic_id = ?
        AND passed = TRUE
      LIMIT 1
      `,
      [studentId, subtopicId]
    );

    if (passedAttempts.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        message: "You have already passed this challenge.",
        challengePassed: true,
        advancedUnlocked: true
      });
    }

    // --------------------------------------------------
    // Verify all learning sections are completed
    // --------------------------------------------------

    const [sectionRows] = await connection.query(
      `
      SELECT
        COUNT(ls.id) AS total_sections,
        COUNT(
          CASE
            WHEN ssp.status = 'completed' THEN 1
          END
        ) AS completed_sections
      FROM learning_sections ls
      LEFT JOIN student_section_progress ssp
        ON ssp.section_id = ls.id
        AND ssp.student_id = ?
      WHERE ls.subtopic_id = ?
      `,
      [studentId, subtopicId]
    );

    const totalSections = Number(
      sectionRows[0].total_sections
    );

    const completedSections = Number(
      sectionRows[0].completed_sections
    );

    if (
      totalSections === 0 ||
      completedSections !== totalSections
    ) {
      await connection.rollback();

      return res.status(403).json({
        message: "Complete all learning sections first.",
        totalSections,
        completedSections
      });
    }

    // --------------------------------------------------
    // Get the current challenge cycle and attempt count
    // --------------------------------------------------

    const [cycleRows] = await connection.query(
      `
      SELECT
        COALESCE(MAX(cycle_number), 1) AS cycle_number
      FROM basic_challenge_attempts
      WHERE student_id = ?
        AND subtopic_id = ?
      `,
      [studentId, subtopicId]
    );

    const cycleNumber = Number(
      cycleRows[0].cycle_number
    );

    const [attemptRows] = await connection.query(
      `
      SELECT COUNT(*) AS attempts_used
      FROM basic_challenge_attempts
      WHERE student_id = ?
        AND subtopic_id = ?
        AND cycle_number = ?
      `,
      [studentId, subtopicId, cycleNumber]
    );

    const attemptsUsed = Number(
      attemptRows[0].attempts_used
    );

    if (attemptsUsed >= 5) {
      await connection.rollback();

      return res.status(403).json({
        message:
          "You have used all 5 attempts in this cycle. Review your weak areas before starting another cycle.",
        attemptsUsed,
        cycleNumber,
        reviewRequired: true
      });
    }

    const attemptNumber = attemptsUsed + 1;

    // --------------------------------------------------
    // Fetch correct answers from the database
    // Ensure every question belongs to this subtopic
    // --------------------------------------------------

    const placeholders = questionIds.map(() => "?").join(", ");

    const [questionRows] = await connection.query(
      `
      SELECT id, correct_answer
      FROM basic_challenge_questions
      WHERE subtopic_id = ?
        AND id IN (${placeholders})
      `,
      [subtopicId, ...questionIds]
    );

    if (questionRows.length !== 5) {
      await connection.rollback();

      return res.status(400).json({
        message:
          "The submitted questions are invalid or do not belong to this subtopic."
      });
    }

    const correctAnswers = new Map(
      questionRows.map(question => [
        Number(question.id),
        question.correct_answer
      ])
    );

    // --------------------------------------------------
    // Calculate score on the server
    // --------------------------------------------------

    let correctCount = 0;

    const evaluatedAnswers = answers.map(answer => {
      const questionId = Number(answer.questionId);

      const correctAnswer = correctAnswers.get(questionId);

      const isCorrect =
        answer.selectedAnswer === correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      return {
        questionId,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer,
        isCorrect,
        confidence: answer.confidence
      };
    });

    const wrongCount = 5 - correctCount;
    const score = correctCount * 4;
    const passed = score >= 16;

    // --------------------------------------------------
    // Save attempt
    // --------------------------------------------------

    const [attemptResult] = await connection.query(
      `
      INSERT INTO basic_challenge_attempts (
        student_id,
        subtopic_id,
        attempt_number,
        cycle_number,
        total_questions,
        correct_answers,
        wrong_answers,
        score,
        passed
      )
      VALUES (?, ?, ?, ?, 5, ?, ?, ?, ?)
      `,
      [
        studentId,
        subtopicId,
        attemptNumber,
        cycleNumber,
        correctCount,
        wrongCount,
        score,
        passed
      ]
    );

    const attemptId = attemptResult.insertId;

    // --------------------------------------------------
    // Save each answer and confidence level
    // --------------------------------------------------

    for (const answer of evaluatedAnswers) {
      await connection.query(
        `
        INSERT INTO basic_challenge_answers (
          attempt_id,
          question_id,
          selected_answer,
          correct_answer,
          is_correct,
          confidence,
          mistake_category
        )
        VALUES (?, ?, ?, ?, ?, ?, NULL)
        `,
        [
          attemptId,
          answer.questionId,
          answer.selectedAnswer,
          answer.correctAnswer,
          answer.isCorrect,
          answer.confidence
        ]
      );
    }

    // --------------------------------------------------
    // Commit all database changes
    // --------------------------------------------------

    await connection.commit();

    return res.status(200).json({
      message: passed
        ? "Congratulations! You passed the Basic Challenge."
        : "Challenge submitted. Review your mistakes and try again.",
      attemptId,
      subtopicId: Number(subtopicId),
      cycleNumber,
      attemptNumber,
      totalQuestions: 5,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      score,
      totalMarks: 20,
      passed,
      challengePassed: passed,
      advancedUnlocked: passed
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Submit challenge error:", error);

    return res.status(500).json({
      message: "Failed to submit the challenge."
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
  getChallengeQuestions,
  getChallengeStatus,
  submitChallenge
};

