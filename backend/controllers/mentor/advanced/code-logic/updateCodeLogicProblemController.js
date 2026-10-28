
const db = require("../../../../config/db");

// =====================================================
// UPDATE A DRAFT LOGIC TO CODE PROBLEM
// =====================================================

const updateProblem = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        const {
            title,
            description,
            languageId,
            mode,
            difficulty,
            maxMarks,
            hintText = null,
            publishDate = null,
            dueDate = null,
            content = {}
        } = req.body;

        // 1. Validate problem ID
        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                message: "Invalid problem ID."
            });
        }

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

        // 3. Validate mode
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
            maxMarks === null ||
            maxMarks === undefined ||
            String(maxMarks).trim() === "" ||
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

        // 7. Validate dates
        const isValidDate = (value) =>
            value === null ||
            value === "" ||
            (
                typeof value === "string" &&
                !Number.isNaN(Date.parse(value))
            );

        if (!isValidDate(publishDate) || !isValidDate(dueDate)) {
            return res.status(400).json({
                message: "Invalid publish date or due date."
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

        // 8. Acquire database connection
        connection = await db.getConnection();

        // 9. Begin transaction
        await connection.beginTransaction();
        transactionStarted = true;

        // 10. Confirm ownership and draft status
        const [problems] = await connection.execute(
            `SELECT id
             FROM code_logic_problems
             WHERE id = ?
               AND mentor_id = ?
               AND status = 'draft'
             FOR UPDATE`,
            [problemId, mentorId]
        );

        if (problems.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                message:
                    "Draft problem not found or you do not have permission to edit it."
            });
        }

        // 11. Check that the selected language is active
        const [languages] = await connection.execute(
            `SELECT id
             FROM subjects
             WHERE id = ?
               AND status = 'active'`,
            [Number(languageId)]
        );

        if (languages.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "Selected language is not available."
            });
        }

        // 12. Update main problem details
        await connection.execute(
            `UPDATE code_logic_problems
             SET
                language_id = ?,
                title = ?,
                description = ?,
                mode = ?,
                difficulty = ?,
                max_marks = ?,
                hint_text = ?,
                publish_date = ?,
                due_date = ?
             WHERE id = ?
               AND mentor_id = ?
               AND status = 'draft'`,
            [
                Number(languageId),
                title.trim(),
                description.trim(),
                mode,
                difficulty,
                Number(maxMarks),
                hintText,
                publishDate || null,
                dueDate || null,
                problemId,
                mentorId
            ]
        );

        // 13. Update or insert problem content
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
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                input_description = VALUES(input_description),
                output_description = VALUES(output_description),
                examples = VALUES(examples),
                starter_code = VALUES(starter_code),
                solution_code = VALUES(solution_code),
                algorithm_steps = VALUES(algorithm_steps),
                flow_data = VALUES(flow_data),
                prediction_questions = VALUES(prediction_questions)`,
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

        // 14. Commit transaction
        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            message: "Logic to Code draft updated successfully.",
            problemId,
            status: "draft"
        });

    } catch (error) {
        if (connection && transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Update problem rollback error:",
                    rollbackError
                );
            }
        }

        console.error(
            "Update Logic to Code problem error:",
            error
        );

        return res.status(500).json({
            message: "Failed to update Logic to Code problem."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {
    updateProblem
};
