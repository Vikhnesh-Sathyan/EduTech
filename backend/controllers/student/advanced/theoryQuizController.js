
const pool = require("../../../config/db");

// Reusable condition: quiz must match the logged-in student's education.
const studentEducationFilter = `
    EXISTS (
        SELECT 1
        FROM student_profiles sp
        WHERE sp.user_id = ?
          AND sp.education_program_id = q.education_program_id
          AND sp.department_id = q.department_id
          AND sp.education_year_id = q.education_year_id
          AND EXISTS (
              SELECT 1
              FROM student_subjects ss
              WHERE ss.student_id = sp.user_id
                AND ss.subject_id = q.subject_id
          )
    )
`;

// GET /api/student/advanced/theory-quizzes
const getPublishedQuizzes = async (req, res) => {
    try {
        const [quizzes] = await pool.query(
    `SELECT
        q.id,
        q.title,
        q.description,
        q.topic_id,
        q.subtopic_id,
        q.difficulty,
        q.pass_percentage,
        q.updated_at
     FROM advanced_theory_quizzes q
     WHERE q.status = 'published'
       AND ${studentEducationFilter}
     ORDER BY q.created_at DESC`,
    [req.user.id]
);

        return res.status(200).json({
            success: true,
            quizzes
        });
    } catch (error) {
        console.error("Get theory quizzes error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load theory quizzes"
        });
    }
};

// GET /api/student/advanced/theory-quizzes/:quizId
const getTheoryQuizById = async (req, res) => {
    try {
        const quizId = Number(req.params.quizId);

        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID"
            });
        }

        // Verify the quiz is published AND matches this student.
       
const [quizzes] = await pool.query(
    `SELECT
        q.id,
        q.title,
        q.description,
        q.education_program_id,
        q.department_id,
        q.education_year_id,
        q.subject_id,
        q.topic_id,
        q.subtopic_id,
        q.difficulty,
        q.pass_percentage,

        p.name AS program_name,
        d.name AS department_name,
        ey.name AS education_year_name,
        s.name AS subject_name

     FROM advanced_theory_quizzes q

     LEFT JOIN education_programs p
        ON p.id = q.education_program_id

     LEFT JOIN departments d
        ON d.id = q.department_id

     LEFT JOIN education_years ey
        ON ey.id = q.education_year_id

     LEFT JOIN subjects s
        ON s.id = q.subject_id

     WHERE q.id = ?
       AND q.status = 'published'
       AND ${studentEducationFilter}`,
    [quizId, req.user.id]
);


        if (quizzes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Theory quiz not found"
            });
        }

        const [questions] = await pool.query(
    `SELECT
        id,
        question_text,
        concept_tag,
        marks,
        display_order
     FROM advanced_theory_questions
     WHERE quiz_id = ?
       AND status = 'active'
     ORDER BY display_order ASC, id ASC
     LIMIT 20`,
    [quizId]
);

        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "This quiz has no active questions yet"
            });
        }

        const questionIds = questions.map(question => question.id);
        const placeholders = questionIds.map(() => "?").join(", ");

        const [options] = await pool.query(
            `SELECT
                id,
                question_id,
                option_text,
                display_order
             FROM advanced_theory_options
             WHERE question_id IN (${placeholders})
             ORDER BY display_order ASC, id ASC`,
            questionIds
        );

        const optionsByQuestion = {};

        for (const option of options) {
            if (!optionsByQuestion[option.question_id]) {
                optionsByQuestion[option.question_id] = [];
            }

            optionsByQuestion[option.question_id].push({
                id: option.id,
                option_text: option.option_text
            });
        }

        const quizQuestions = questions.map(question => ({
            ...question,
            options: optionsByQuestion[question.id] || []
        }));

        return res.status(200).json({
            success: true,
            quiz: quizzes[0],
            questions: quizQuestions
        });

    } catch (error) {
        console.error("Get theory quiz details error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load theory quiz"
        });
    }
};

module.exports = {
    getPublishedQuizzes,
    getTheoryQuizById
};
