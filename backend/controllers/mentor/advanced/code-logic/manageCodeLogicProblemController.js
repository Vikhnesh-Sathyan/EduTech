
const db = require("../../../../config/db");

// =====================================================
// PUBLISH A DRAFT PROBLEM
// =====================================================

const publishProblem = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                message: "Invalid problem ID."
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();
        transactionStarted = true;

        // 1. Verify ownership and lock the draft
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
                message: "Draft problem not found or you do not have permission to publish it."
            });
        }

        // 2. Get the problem content
        const [contentRows] = await connection.execute(
            `SELECT
                input_description,
                output_description,
                examples,
                solution_code,
                algorithm_steps
             FROM code_logic_problem_content
             WHERE problem_id = ?`,
            [problemId]
        );

        if (contentRows.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "Complete the problem content before publishing."
            });
        }

        const content = contentRows[0];

        // MySQL JSON fields may be returned as arrays or JSON strings.
        const parseJsonArray = (value) => {
            if (Array.isArray(value)) return value;

            if (typeof value === "string") {
                try {
                    const parsed = JSON.parse(value);
                    return Array.isArray(parsed) ? parsed : null;
                } catch {
                    return null;
                }
            }

            return null;
        };

        const examples = parseJsonArray(content.examples);
        const algorithmSteps = parseJsonArray(content.algorithm_steps);

        // 3. Validate required content
        if (
            !content.input_description?.trim() ||
            !content.output_description?.trim() ||
            !content.solution_code?.trim() ||
            !examples ||
            examples.length === 0 ||
            !algorithmSteps ||
            algorithmSteps.length === 0
        ) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "Complete the input, output, examples, solution code, and algorithm steps before publishing."
            });
        }

        // 4. Publish the problem
        await connection.execute(
            `UPDATE code_logic_problems
             SET status = 'published'
             WHERE id = ?
               AND mentor_id = ?
               AND status = 'draft'`,
            [problemId, mentorId]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            message: "Problem published successfully.",
            problemId,
            status: "published"
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error("Publish Logic to Code problem error:", error);

        return res.status(500).json({
            message: "Failed to publish the problem."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


// =====================================================
// UNPUBLISH A PUBLISHED PROBLEM
// =====================================================

const unpublishProblem = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                message: "Invalid problem ID."
            });
        }

        const [result] = await db.execute(
            `UPDATE code_logic_problems
             SET status = 'draft'
             WHERE id = ?
               AND mentor_id = ?
               AND status = 'published'`,
            [problemId, mentorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Published problem not found or you do not have permission to unpublish it."
            });
        }

        return res.status(200).json({
            message: "Problem moved back to draft successfully.",
            problemId,
            status: "draft"
        });

    } catch (error) {
        console.error("Unpublish Logic to Code problem error:", error);

        return res.status(500).json({
            message: "Failed to unpublish the problem."
        });
    }
};


 // =====================================================
// DEACTIVATE A PROBLEM
// =====================================================

const deactivateProblem = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                message: "Invalid problem ID."
            });
        }

        const [result] = await db.execute(
            `UPDATE code_logic_problems
             SET status = 'inactive'
             WHERE id = ?
               AND mentor_id = ?
               AND status IN ('draft', 'published')`,
            [problemId, mentorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Problem not found or already inactive."
            });
        }

        return res.status(200).json({
            message: "Problem deactivated successfully.",
            problemId,
            status: "inactive"
        });
    } catch (error) {
        console.error("Deactivate Logic to Code problem error:", error);

        return res.status(500).json({
            message: "Failed to deactivate the problem."
        });
    }
};

// =====================================================
// REACTIVATE AN INACTIVE PROBLEM AS A DRAFT
// =====================================================

const reactivateProblem = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                message: "Invalid problem ID."
            });
        }

        const [result] = await db.execute(
            `UPDATE code_logic_problems
             SET status = 'draft'
             WHERE id = ?
               AND mentor_id = ?
               AND status = 'inactive'`,
            [problemId, mentorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Inactive problem not found or you do not have permission to reactivate it."
            });
        }

        return res.status(200).json({
            message: "Problem reactivated as a draft successfully.",
            problemId,
            status: "draft"
        });
    } catch (error) {
        console.error("Reactivate Logic to Code problem error:", error);

        return res.status(500).json({
            message: "Failed to reactivate the problem."
        });
    }
};


module.exports = {
    publishProblem,
    unpublishProblem,
    deactivateProblem,
    reactivateProblem
};
