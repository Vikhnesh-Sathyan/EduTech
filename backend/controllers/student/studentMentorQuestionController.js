const db = require("../../config/db");

// =====================================================
// CREATE A QUESTION FOR MY ASSIGNED MENTOR
// =====================================================

const createMentorQuestion = async (req, res) => {
    const studentId = req.user.id;

    const { subtopicId, question } = req.body;

    // Validate subtopic ID
    const parsedSubtopicId = Number(subtopicId);

    if (
        !Number.isInteger(parsedSubtopicId) ||
        parsedSubtopicId <= 0
    ) {
        return res.status(400).json({
            message: "A valid learning topic is required."
        });
    }

    // Validate question
    if (
        typeof question !== "string" ||
        !question.trim()
    ) {
        return res.status(400).json({
            message: "Please enter your question."
        });
    }

    const trimmedQuestion = question.trim();

    if (trimmedQuestion.length > 5000) {
        return res.status(400).json({
            message: "Your question cannot exceed 5000 characters."
        });
    }

    try {
        // Find the student's currently assigned mentor
        const [mentors] = await db.query(
            `
            SELECT msr.mentor_id
            FROM mentor_student_relationships msr
            INNER JOIN users u
                ON u.id = msr.mentor_id
            INNER JOIN mentor_profiles mp
                ON mp.user_id = msr.mentor_id
            WHERE msr.student_id = ?
              AND msr.status = 'accepted'
              AND msr.is_active = TRUE
              AND u.role = 'mentor'
              AND u.status = 'active'
              AND mp.verification_status = 'approved'
            LIMIT 1
            `,
            [studentId]
        );

        if (mentors.length === 0) {
            return res.status(403).json({
                message:
                    "You need an active, approved mentor before asking a question."
            });
        }

        const mentorId = mentors[0].mentor_id;

        // Confirm that the learning subtopic exists and is active
        const [subtopics] = await db.query(
            `
            SELECT id
            FROM learning_subtopics
            WHERE id = ?
              AND status = 'active'
            LIMIT 1
            `,
            [parsedSubtopicId]
        );

        if (subtopics.length === 0) {
            return res.status(404).json({
                message: "The selected learning topic was not found."
            });
        }

        // Save the question
        const [result] = await db.query(
            `
            INSERT INTO student_mentor_questions (
                student_id,
                mentor_id,
                subtopic_id,
                question
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                studentId,
                mentorId,
                parsedSubtopicId,
                trimmedQuestion
            ]
        );

        return res.status(201).json({
            message: "Your question has been sent to your mentor.",
            question: {
                id: result.insertId,
                mentorId,
                subtopicId: parsedSubtopicId,
                question: trimmedQuestion,
                status: "pending"
            }
        });

    } catch (error) {
        console.error(
            "Create mentor question failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to send your question."
        });
    }
};


// =====================================================
// GET MY QUESTIONS AND MENTOR RESPONSES
// =====================================================

const getMyMentorQuestions = async (req, res) => {
    const studentId = req.user.id;

    try {
        const [questions] = await db.query(
            `
            SELECT
                q.id,
                q.subtopic_id,
                ls.title AS subtopic_title,
                q.question,
                q.status,
                q.mentor_response,
                q.created_at,
                q.updated_at,
                q.answered_at,
                u.name AS mentor_name,
                mp.professional_title AS mentor_title
            FROM student_mentor_questions q
            INNER JOIN users u
                ON u.id = q.mentor_id
            LEFT JOIN mentor_profiles mp
                ON mp.user_id = q.mentor_id
            LEFT JOIN learning_subtopics ls
                ON ls.id = q.subtopic_id
            WHERE q.student_id = ?
            ORDER BY q.created_at DESC
            `,
            [studentId]
        );

        return res.status(200).json({
            questions
        });

    } catch (error) {
        console.error(
            "Get mentor questions failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load your mentor questions."
        });
    }
};


module.exports = {
    createMentorQuestion,
    getMyMentorQuestions
};
