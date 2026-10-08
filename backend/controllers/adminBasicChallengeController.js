const db = require("../config/db");
const XLSX = require("xlsx");

// ======================================================
// PREVIEW BASIC CHALLENGE QUESTIONS
// ======================================================

const previewQuestions = async (req, res) => {
  try {
    // Check file
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an Excel or CSV file."
      });
    }

    // Read uploaded file
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer"
    });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: ""
    });

    if (!rows.length) {
      return res.status(400).json({
        message: "The uploaded file is empty."
      });
    }

    const requiredColumns = [
      "question",
      "option_a",
      "option_b",
      "option_c",
      "option_d",
      "correct_answer"
    ];

    const validQuestions = [];
    const errors = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      const missingColumns = requiredColumns.filter(
        column => !String(row[column] || "").trim()
      );

      if (missingColumns.length > 0) {
        errors.push({
          row: rowNumber,
          message: `Missing: ${missingColumns.join(", ")}`
        });

        return;
      }

      const correctAnswer = String(row.correct_answer)
        .trim()
        .toUpperCase();

      if (!["A", "B", "C", "D"].includes(correctAnswer)) {
        errors.push({
          row: rowNumber,
          message: "Correct answer must be A, B, C or D."
        });

        return;
      }

      validQuestions.push({
        question: String(row.question).trim(),
        option_a: String(row.option_a).trim(),
        option_b: String(row.option_b).trim(),
        option_c: String(row.option_c).trim(),
        option_d: String(row.option_d).trim(),
        correct_answer: correctAnswer
      });
    });

    return res.status(200).json({
      message: "File processed successfully.",
      totalRows: rows.length,
      validCount: validQuestions.length,
      errorCount: errors.length,
      questions: validQuestions,
      errors
    });

  } catch (error) {
    console.error("Preview questions error:", error);

    return res.status(500).json({
      message: "Failed to process the question file."
    });
  }
};

// ======================================================
// CONFIRM BASIC CHALLENGE QUESTIONS IMPORT
// ======================================================

const confirmImport = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { subtopicId } = req.params;
    const { questions } = req.body;

    // --------------------------------------------------
    // VALIDATE REQUEST
    // --------------------------------------------------

    if (!subtopicId) {
      return res.status(400).json({
        message: "Subtopic information is missing."
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: "No questions were provided."
      });
    }

    // --------------------------------------------------
    // CHECK SUBTOPIC
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
      return res.status(404).json({
        message: "Subtopic not found."
      });
    }

    // --------------------------------------------------
    // VALIDATE QUESTIONS
    // --------------------------------------------------

    for (const question of questions) {

      if (
        !question.question ||
        !question.option_a ||
        !question.option_b ||
        !question.option_c ||
        !question.option_d ||
        !["A", "B", "C", "D"].includes(
          String(question.correct_answer).toUpperCase()
        )
      ) {
        return res.status(400).json({
          message: "One or more questions contain invalid data."
        });
      }
    }

    // --------------------------------------------------
    // START TRANSACTION
    // --------------------------------------------------

    await connection.beginTransaction();

    // --------------------------------------------------
    // INSERT QUESTIONS
    // --------------------------------------------------

    for (const question of questions) {

      await connection.query(
        `
        INSERT INTO basic_challenge_questions
        (
          subtopic_id,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          subtopicId,
          question.question.trim(),
          question.option_a.trim(),
          question.option_b.trim(),
          question.option_c.trim(),
          question.option_d.trim(),
          String(question.correct_answer).toUpperCase()
        ]
      );
    }

    // --------------------------------------------------
    // COMMIT
    // --------------------------------------------------

    await connection.commit();

    return res.status(201).json({
      message: `${questions.length} questions imported successfully.`,
      importedCount: questions.length
    });

  } catch (error) {

    await connection.rollback();

    console.error(
      "Confirm questions import error:",
      error
    );

    return res.status(500).json({
      message: "Failed to import questions."
    });

  } finally {

    connection.release();

  }
};

module.exports = {
  previewQuestions,
  confirmImport
};