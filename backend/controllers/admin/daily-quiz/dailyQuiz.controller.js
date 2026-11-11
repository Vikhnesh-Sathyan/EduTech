
const db = require("../../../config/db");

// ==========================================
// GET ACADEMIC OPTIONS
// ==========================================
const getAcademicOptions = async (req, res) => {
    try {
        const [subjects] = await db.query(
            `SELECT
                ep.id AS program_id,
                ep.name AS program_name,

                d.id AS department_id,
                d.name AS department_name,

                ey.id AS year_id,
                ey.name AS year_name,

                s.id AS subject_id,
                s.name AS subject_name

             FROM subjects s

             INNER JOIN education_years ey
                ON s.education_year_id = ey.id

             INNER JOIN departments d
                ON ey.department_id = d.id

             INNER JOIN education_programs ep
                ON d.education_program_id = ep.id

             WHERE
                s.status = 'active'
                AND ey.status = 'active'
                AND d.status = 'active'
                AND ep.status = 'active'

             ORDER BY
                ep.name,
                d.name,
                ey.year_order,
                s.name`
        );

        return res.status(200).json({
            message: "Academic options fetched successfully",
            subjects
        });

    } catch (error) {
        console.error("Get daily quiz academic options error:", error);

        return res.status(500).json({
            message: "Failed to fetch academic options"
        });
    }
};


// ==========================================
// CREATE DAILY QUIZ
// ==========================================
const createQuiz = async (req, res) => {
    try {
        const {
            subject_id,
            title,
            instructions,
            quiz_date,
            publish_time = "08:00"
        } = req.body;

        // ----------------------------------
        // VALIDATE SUBJECT ID
        // ----------------------------------
        if (
            !Number.isInteger(Number(subject_id)) ||
            Number(subject_id) <= 0
        ) {
            return res.status(400).json({
                message: "Valid subject ID is required"
            });
        }

        // ----------------------------------
        // VALIDATE TITLE
        // ----------------------------------
        if (
            typeof title !== "string" ||
            !title.trim()
        ) {
            return res.status(400).json({
                message: "Quiz title is required"
            });
        }

        if (title.trim().length > 200) {
            return res.status(400).json({
                message: "Quiz title cannot exceed 200 characters"
            });
        }

        // ----------------------------------
        // VALIDATE QUIZ DATE
        // ----------------------------------
        if (
            typeof quiz_date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(quiz_date)
        ) {
            return res.status(400).json({
                message: "Quiz date must use YYYY-MM-DD format"
            });
        }

        const [year, month, day] = quiz_date.split("-").map(Number);

        const dateCheck = new Date(
            Date.UTC(year, month - 1, day)
        );

        if (
            dateCheck.getUTCFullYear() !== year ||
            dateCheck.getUTCMonth() !== month - 1 ||
            dateCheck.getUTCDate() !== day
        ) {
            return res.status(400).json({
                message: "Invalid quiz date"
            });
        }

        // ----------------------------------
        // VALIDATE PUBLICATION TIME
        // ----------------------------------
        if (
            typeof publish_time !== "string" ||
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(publish_time)
        ) {
            return res.status(400).json({
                message: "Publish time must use HH:MM format"
            });
        }

        // ----------------------------------
        // GET TODAY'S DATE IN INDIA
        // ----------------------------------
        const indiaParts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(new Date());

        const todayIndia = [
            indiaParts.find(part => part.type === "year").value,
            indiaParts.find(part => part.type === "month").value,
            indiaParts.find(part => part.type === "day").value
        ].join("-");

        if (quiz_date < todayIndia) {
            return res.status(400).json({
                message: "Quiz date cannot be in the past"
            });
        }

        // ----------------------------------
        // CHECK ACTIVE SUBJECT
        // ----------------------------------
        const [subjects] = await db.query(
            `SELECT id
             FROM subjects
             WHERE id = ?
             AND status = 'active'`,
            [Number(subject_id)]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                message: "Active subject not found"
            });
        }

        // ----------------------------------
        // CONVERT IST PUBLICATION TIME TO UTC
        // ----------------------------------
        const [hours, minutes] = publish_time
            .split(":")
            .map(Number);

        const scheduledDate = new Date(
            Date.UTC(year, month - 1, day, hours, minutes) -
            (5 * 60 + 30) * 60 * 1000
        );

        // ----------------------------------
        // EXPIRY: MIDNIGHT IST NEXT DAY
        // ----------------------------------
        const expiryDate = new Date(
            Date.UTC(year, month - 1, day + 1, 0, 0) -
            (5 * 60 + 30) * 60 * 1000
        );

        // ----------------------------------
        // FORMAT UTC DATES FOR MYSQL
        // ----------------------------------
        const toMySQLDateTime = (date) =>
            date.toISOString().slice(0, 19).replace("T", " ");

        const scheduledAt = toMySQLDateTime(scheduledDate);
        const expiresAt = toMySQLDateTime(expiryDate);

        // ----------------------------------
        // CREATE DRAFT QUIZ
        // ----------------------------------
        const [result] = await db.query(
            `INSERT INTO daily_quizzes
                (
                    subject_id,
                    created_by,
                    title,
                    instructions,
                    quiz_date,
                    publish_time,
                    scheduled_at,
                    expires_at,
                    status
                )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [
                Number(subject_id),
                req.user.id,
                title.trim(),
                typeof instructions === "string"
                    ? instructions.trim() || null
                    : null,
                quiz_date,
                publish_time + ":00",
                scheduledAt,
                expiresAt
            ]
        );

        return res.status(201).json({
            message: "Daily quiz created successfully",

            quiz: {
                id: result.insertId,
                subject_id: Number(subject_id),
                title: title.trim(),
                instructions: typeof instructions === "string"
                    ? instructions.trim() || null
                    : null,
                quiz_date,
                publish_time: publish_time + ":00",
                scheduled_at: scheduledAt,
                expires_at: expiresAt,
                status: "draft"
            }
        });

    } catch (error) {

        // ----------------------------------
        // DUPLICATE QUIZ CHECK
        // ----------------------------------
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "A daily quiz already exists for this subject and date"
            });
        }

        console.error("Create daily quiz error:", error);

        return res.status(500).json({
            message: "Failed to create daily quiz"
        });
    }
};

// ==========================================
// GET DAILY QUIZ DETAILS
// ==========================================
const getQuizDetails = async (req, res) => {
    try {
        const quizId = Number(req.params.quizId);

        // ----------------------------------
        // VALIDATE QUIZ ID
        // ----------------------------------
        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                message: "Valid quiz ID is required"
            });
        }

        // ----------------------------------
        // FETCH QUIZ + ACADEMIC DETAILS
        // ----------------------------------
        const [quizzes] = await db.query(
            `SELECT
                dq.id,
                dq.subject_id,
                dq.created_by,

                dq.title,
                dq.instructions,

                dq.quiz_date,
                dq.publish_time,
                dq.scheduled_at,
                dq.expires_at,

                dq.status,
                dq.created_at,
                dq.updated_at,

                s.name AS subject_name,

                ey.id AS year_id,
                ey.name AS year_name,

                d.id AS department_id,
                d.name AS department_name,

                ep.id AS program_id,
                ep.name AS program_name,

                (
                    SELECT COUNT(*)
                    FROM daily_quiz_questions q
                    WHERE q.daily_quiz_id = dq.id
                ) AS total_questions,

                (
                    SELECT COUNT(*)
                    FROM daily_quiz_attempts a
                    WHERE a.daily_quiz_id = dq.id
                ) AS total_attempts

             FROM daily_quizzes dq

             INNER JOIN subjects s
                ON dq.subject_id = s.id

             INNER JOIN education_years ey
                ON s.education_year_id = ey.id

             INNER JOIN departments d
                ON ey.department_id = d.id

             INNER JOIN education_programs ep
                ON d.education_program_id = ep.id

             WHERE dq.id = ?`,
            [quizId]
        );

        if (quizzes.length === 0) {
            return res.status(404).json({
                message: "Daily quiz not found"
            });
        }

        // ----------------------------------
        // FETCH QUESTIONS AND OPTIONS
        // ----------------------------------
        const [rows] = await db.query(
            `SELECT
                q.id AS question_id,
                q.question_text,
                q.explanation,
                q.question_order,

                o.id AS option_id,
                o.option_text,
                o.is_correct,
                o.option_order

             FROM daily_quiz_questions q

             LEFT JOIN daily_quiz_options o
                ON q.id = o.question_id

             WHERE q.daily_quiz_id = ?

             ORDER BY
                q.question_order,
                o.option_order`,
            [quizId]
        );

        // ----------------------------------
        // ORGANIZE QUESTIONS AND OPTIONS
        // ----------------------------------
        const questionsMap = new Map();

        for (const row of rows) {

            if (!questionsMap.has(row.question_id)) {
                questionsMap.set(row.question_id, {
                    id: row.question_id,
                    question_text: row.question_text,
                    explanation: row.explanation,
                    question_order: row.question_order,
                    options: []
                });
            }

            if (row.option_id !== null) {
                questionsMap.get(row.question_id).options.push({
                    id: row.option_id,
                    option_text: row.option_text,
                    is_correct: Boolean(row.is_correct),
                    option_order: row.option_order
                });
            }
        }

        // ----------------------------------
        // FINAL QUIZ RESPONSE
        // ----------------------------------
        const quiz = {
            ...quizzes[0],

            total_questions: Number(quizzes[0].total_questions),
            total_attempts: Number(quizzes[0].total_attempts),

            questions: Array.from(questionsMap.values())
        };

        return res.status(200).json({
            message: "Daily quiz details fetched successfully",
            quiz
        });

    } catch (error) {

        console.error("Get daily quiz details error:", error);

        return res.status(500).json({
            message: "Failed to fetch daily quiz details"
        });
    }
};




// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
    getAcademicOptions,
    createQuiz,
    getQuizDetails
};
