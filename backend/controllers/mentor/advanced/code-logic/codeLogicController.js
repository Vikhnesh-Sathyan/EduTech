
const db = require("../../../../config/db");

// =====================================================
// GET ACTIVE PROGRAMMING LANGUAGES
// =====================================================

const getAvailableLanguages = async (req, res) => {
    try {
        const [languages] = await db.execute(
            `SELECT id, name
             FROM subjects
             WHERE status = 'active'
             ORDER BY name ASC`
        );

        return res.status(200).json({
            languages
        });

    } catch (error) {
        console.error(
            "Logic to Code languages fetch error:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch available languages."
        });
    }
};

// =====================================================
// GET ACTIVE LOGIC TO CODE CONCEPTS
// =====================================================

const getMyConcepts = async (req, res) => {
    try {
        const [concepts] = await db.execute(
            `SELECT
                id,
                name,
                description
             FROM code_logic_concepts
             WHERE status = 'active'
             ORDER BY name ASC`
        );

        return res.status(200).json({
            concepts
        });

    } catch (error) {
        console.error(
            "Logic to Code concepts fetch error:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch Logic to Code concepts."
        });
    }
};

// =====================================================
// CREATE A DRAFT LOGIC TO CODE PROBLEM
// =====================================================

const createProblem = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        // 1. Get database connection
        connection = await db.getConnection();

        const mentorId = req.user.id;

        const {
            title,
            description,
            languageId,
            mode = "build_code",
            difficulty = "easy",
            maxMarks = 100,
            hintText = null,
            publishDate = null,
            dueDate = null,
            content = {}
        } = req.body;

        // 2. Validate required fields
        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof description !== "string" ||
            !description.trim() ||
            languageId === null ||
            languageId === undefined ||
            String(languageId).trim() === "" ||
            !Number.isInteger(Number(languageId)) ||
            Number(languageId) <= 0
        ) {
            return res.status(400).json({
                message:
                    "Title, description and a valid language are required."
            });
        }

        // 3. Validate problem mode
        if (!["build_code", "understand_code"].includes(mode)) {
            return res.status(400).json({
                message: "Invalid Logic to Code mode."
            });
        }

        // 4. Validate difficulty
        if (!["easy", "medium", "hard"].includes(difficulty)) {
            return res.status(400).json({
                message: "Invalid difficulty level."
            });
        }

        // 5. Validate maximum marks
        if (
            !Number.isFinite(Number(maxMarks)) ||
            Number(maxMarks) <= 0 ||
            Number(maxMarks) > 99999.99
        ) {
            return res.status(400).json({
                message: "Maximum marks must be greater than zero."
            });
        }

        // 6. Validate content object
        if (
            !content ||
            typeof content !== "object" ||
            Array.isArray(content)
        ) {
            return res.status(400).json({
                message: "Problem content must be a valid object."
            });
        }

        // 7. Check that the selected language is active
        const [languages] = await connection.execute(
            `SELECT id
             FROM subjects
             WHERE id = ?
               AND status = 'active'`,
            [Number(languageId)]
        );

        if (languages.length === 0) {
            return res.status(400).json({
                message: "Selected language is not available."
            });
        }

        // 8. Validate optional dates
        if (
            publishDate !== null &&
            publishDate !== "" &&
            Number.isNaN(Date.parse(publishDate))
        ) {
            return res.status(400).json({
                message: "Invalid publish date."
            });
        }

        if (
            dueDate !== null &&
            dueDate !== "" &&
            Number.isNaN(Date.parse(dueDate))
        ) {
            return res.status(400).json({
                message: "Invalid due date."
            });
        }

        if (
            publishDate &&
            dueDate &&
            new Date(dueDate) < new Date(publishDate)
        ) {
            return res.status(400).json({
                message: "Due date cannot be earlier than publish date."
            });
        }

        // 9. Begin transaction
        await connection.beginTransaction();
        transactionStarted = true;

        // 10. Create the problem as a draft
        const [problemResult] = await connection.execute(
            `INSERT INTO code_logic_problems
             (
                 mentor_id,
                 language_id,
                 title,
                 description,
                 mode,
                 difficulty,
                 max_marks,
                 hint_text,
                 publish_date,
                 due_date,
                 status
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [
                mentorId,
                Number(languageId),
                title.trim(),
                description.trim(),
                mode,
                difficulty,
                Number(maxMarks),
                hintText,
                publishDate || null,
                dueDate || null
            ]
        );

        const problemId = problemResult.insertId;

        // 11. Create the problem content
        await connection.execute(
            `INSERT INTO code_logic_problem_content
             (
                 problem_id,
                 input_description,
                 output_description,
                 examples,
                 starter_code,
                 solution_code,
                 algorithm_steps,
                 flow_data,
                 prediction_questions
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                problemId,
                content.inputDescription ?? null,
                content.outputDescription ?? null,
                content.examples == null
                    ? null
                    : JSON.stringify(content.examples),
                content.starterCode ?? null,
                content.solutionCode ?? null,
                content.algorithmSteps == null
                    ? null
                    : JSON.stringify(content.algorithmSteps),
                content.flowData == null
                    ? null
                    : JSON.stringify(content.flowData),
                content.predictionQuestions == null
                    ? null
                    : JSON.stringify(content.predictionQuestions)
            ]
        );

        // 12. Commit transaction
        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            message: "Logic to Code problem created successfully.",
            problemId,
            status: "draft"
        });

    } catch (error) {
        // Roll back only if a transaction is active
        if (connection && transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Create problem rollback error:",
                    rollbackError
                );
            }
        }

        console.error(
            "Create Logic to Code problem error:",
            error
        );

        return res.status(500).json({
            message: "Failed to create Logic to Code problem."
        });

    } finally {
        // Release only if a connection was acquired
        if (connection) {
            connection.release();
        }
    }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    getAvailableLanguages,
    getMyConcepts,
    createProblem
};
