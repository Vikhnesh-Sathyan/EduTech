const db = require("../config/db");

// ==========================================
// CREATE DIAGNOSTIC QUESTION
// ==========================================

const createDiagnosticQuestion = async (req, res) => {
    try {

        const {
            subjectId,
            topicId,
            question,
            code,
            optionA,
            optionB,
            optionC,
            optionD,
            correctOption,
            difficulty
        } = req.body;


        // Check required fields
        if (
            !subjectId ||
            !topicId ||
            !question ||
            !optionA ||
            !optionB ||
            !optionC ||
            !optionD ||
            !correctOption ||
            !difficulty
        ) {
            return res.status(400).json({
                message: "All question fields are required"
            });
        }


        // Check that topic belongs to the selected subject
        const topicSql = `
            SELECT id
            FROM subject_topics
            WHERE id = ?
              AND subject_id = ?
              AND status = 'active'
        `;

        const [topicResult] = await db.query(
            topicSql,
            [topicId, subjectId]
        );


        if (topicResult.length === 0) {
            return res.status(400).json({
                message:
                    "Selected topic does not belong to this subject"
            });
        }


        // Insert question
        const questionSql = `
            INSERT INTO diagnostic_questions (
                subject_id,
                topic_id,
                question,
                code,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                difficulty
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(
            questionSql,
            [
                subjectId,
                topicId,
                question,
                code || null,
                optionA,
                optionB,
                optionC,
                optionD,
                correctOption,
                difficulty
            ]
        );


        res.status(201).json({
            message:
                "Diagnostic question created successfully",
            questionId: result.insertId
        });

    } catch (error) {

        console.error(
            "Create diagnostic question error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create diagnostic question"
        });
    }
};


// ==========================================
// UPDATE DIAGNOSTIC QUESTION
// ==========================================

const updateDiagnosticQuestion = async (req, res) => {

    try {

        const { questionId } = req.params;

        const {
            subjectId,
            topicId,
            question,
            code,
            optionA,
            optionB,
            optionC,
            optionD,
            correctOption,
            difficulty
        } = req.body;


        // Check required fields
        if (
            !questionId ||
            !subjectId ||
            !topicId ||
            !question ||
            !optionA ||
            !optionB ||
            !optionC ||
            !optionD ||
            !correctOption ||
            !difficulty
        ) {
            return res.status(400).json({
                message:
                    "All question fields are required"
            });
        }


        // Check that topic belongs to selected subject
        const topicSql = `
            SELECT id
            FROM subject_topics
            WHERE id = ?
              AND subject_id = ?
              AND status = 'active'
        `;

        const [topicResult] = await db.query(
            topicSql,
            [topicId, subjectId]
        );


        if (topicResult.length === 0) {
            return res.status(400).json({
                message:
                    "Selected topic does not belong to this subject"
            });
        }


        // Check that question exists
        const questionCheckSql = `
            SELECT id
            FROM diagnostic_questions
            WHERE id = ?
        `;

        const [questionResult] = await db.query(
            questionCheckSql,
            [questionId]
        );


        if (questionResult.length === 0) {
            return res.status(404).json({
                message:
                    "Diagnostic question not found"
            });
        }


        // Update question
        const updateSql = `
            UPDATE diagnostic_questions
            SET
                subject_id = ?,
                topic_id = ?,
                question = ?,
                code = ?,
                option_a = ?,
                option_b = ?,
                option_c = ?,
                option_d = ?,
                correct_option = ?,
                difficulty = ?
            WHERE id = ?
        `;

        await db.query(
            updateSql,
            [
                subjectId,
                topicId,
                question,
                code || null,
                optionA,
                optionB,
                optionC,
                optionD,
                correctOption,
                difficulty,
                questionId
            ]
        );


        res.status(200).json({
            message:
                "Diagnostic question updated successfully"
        });

    } catch (error) {

        console.error(
            "Update diagnostic question error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update diagnostic question"
        });
    }
};


// ==========================================
// GET DIAGNOSTIC QUESTIONS
// ==========================================

const getDiagnosticQuestions = async (req, res) => {
    try {

        const sql = `
            SELECT
                dq.id,
                dq.subject_id,
                s.name AS subject_name,
                dq.topic_id,
                st.name AS topic_name,
                dq.question,
                dq.code,
                dq.option_a,
                dq.option_b,
                dq.option_c,
                dq.option_d,
                dq.correct_option,
                dq.difficulty,
                dq.status,
                dq.created_at
            FROM diagnostic_questions dq

            INNER JOIN subjects s
                ON s.id = dq.subject_id

            INNER JOIN subject_topics st
                ON st.id = dq.topic_id

            ORDER BY dq.created_at DESC
        `;

        const [questions] = await db.query(sql);

        res.status(200).json({
            questions
        });

    } catch (error) {

        console.error(
            "Get diagnostic questions error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to load diagnostic questions"
        });
    }
};


// ==========================================
// GET SUBJECTS FOR DIAGNOSTIC MANAGEMENT
// ==========================================

const getDiagnosticSubjects = async (req, res) => {
    try {

        const sql = `
            SELECT
                id,
                name
            FROM subjects
            WHERE status = 'active'
            ORDER BY name ASC
        `;

        const [subjects] = await db.query(sql);

        res.status(200).json({
            subjects
        });

    } catch (error) {

        console.error(
            "Get diagnostic subjects error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to load subjects"
        });
    }
};


// ==========================================
// GET TOPICS FOR A SUBJECT
// ==========================================

const getDiagnosticTopics = async (req, res) => {
    try {

        const { subjectId } = req.params;

        const sql = `
            SELECT
                id,
                name
            FROM subject_topics
            WHERE subject_id = ?
              AND status = 'active'
            ORDER BY display_order ASC, name ASC
        `;

        const [topics] = await db.query(
            sql,
            [subjectId]
        );

        res.status(200).json({
            topics
        });

    } catch (error) {

        console.error(
            "Get diagnostic topics error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to load topics"
        });
    }
};


module.exports = {
    createDiagnosticQuestion,
    updateDiagnosticQuestion,
    getDiagnosticQuestions,
    getDiagnosticSubjects,
    getDiagnosticTopics
};