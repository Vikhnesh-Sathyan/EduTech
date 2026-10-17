const db = require("../../../config/db");


const createAlgorithmSteps = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can create algorithm steps."
            });
        }

        const solutionId = Number(req.params.solutionId);

        if (!Number.isInteger(solutionId) || solutionId <= 0) {
            return res.status(400).json({
                message: "Invalid solution ID."
            });
        }

        const { steps } = req.body;

        if (!Array.isArray(steps) || steps.length === 0) {
            return res.status(400).json({
                message: "Provide at least one algorithm step."
            });
        }

        if (steps.length > 100) {
            return res.status(400).json({
                message: "A maximum of 100 algorithm steps is allowed."
            });
        }

        const allowedTypes = [
            "start",
            "input",
            "process",
            "condition",
            "output",
            "loop",
            "end"
        ];

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];

            if (
                !step.step_title?.trim() ||
                !step.step_description?.trim()
            ) {
                return res.status(400).json({
                    message: `Step ${i + 1} requires a title and description.`
                });
            }

            if (
                step.step_type &&
                !allowedTypes.includes(step.step_type)
            ) {
                return res.status(400).json({
                    message: `Step ${i + 1} has an invalid step type.`
                });
            }

            const startLine = step.code_line_start;
            const endLine = step.code_line_end;

            if (
                (startLine != null &&
                    (!Number.isInteger(Number(startLine)) ||
                        Number(startLine) <= 0)) ||
                (endLine != null &&
                    (!Number.isInteger(Number(endLine)) ||
                        Number(endLine) <= 0)) ||
                (startLine != null &&
                    endLine != null &&
                    Number(endLine) < Number(startLine))
            ) {
                return res.status(400).json({
                    message: `Step ${i + 1} has an invalid code line range.`
                });
            }
        }

      
const [solutions] = await db.query(
    `SELECT id, student_id
     FROM student_code_solutions
     WHERE id = ?`,
    [solutionId]
);

if (solutions.length === 0) {
    return res.status(404).json({
        message: "Code solution not found."
    });
}

if (Number(solutions[0].student_id) !== Number(req.user.id)) {
    return res.status(403).json({
        message: "You can only modify algorithm steps for your own solutions."
    });
}


        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            await connection.query(
                `DELETE FROM student_code_algorithm_steps
                 WHERE solution_id = ?`,
                [solutionId]
            );

            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];

                await connection.query(
                    `INSERT INTO student_code_algorithm_steps
                    (
                        solution_id,
                        step_number,
                        step_title,
                        step_description,
                        step_type,
                        code_line_start,
                        code_line_end
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        solutionId,
                        i + 1,
                        step.step_title.trim(),
                        step.step_description.trim(),
                        step.step_type || "process",
                        step.code_line_start ?? null,
                        step.code_line_end ?? null
                    ]
                );
            }

            await connection.commit();

            return res.status(201).json({
                message: "Algorithm steps saved successfully.",
                total_steps: steps.length
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Save algorithm steps error:", error);

        return res.status(500).json({
            message: "Failed to save algorithm steps."
        });
    }
};



// ==========================================
// GET ALGORITHM STEPS
// ==========================================

const getAlgorithmSteps = async (req, res) => {
    try {
        const { solutionId } = req.params;

        const [solutions] = await db.query(
            `SELECT
                cs.id,
                cs.student_id,
                scp.status AS post_status,
                s.status AS subject_status
             FROM student_code_solutions cs
             INNER JOIN student_code_posts scp
                ON scp.id = cs.post_id
             INNER JOIN subjects s
                ON s.id = scp.subject_id
             WHERE cs.id = ?`,
            [solutionId]
        );

        if (solutions.length === 0) {
            return res.status(404).json({
                message: "Code solution not found."
            });
        }

        const solution = solutions[0];

        const isOwner =
            req.user.role === "student" &&
            Number(solution.student_id) === Number(req.user.id);

        if (
            (
                solution.post_status !== "published" ||
                solution.subject_status !== "active"
            ) &&
            !isOwner
        ) {
            return res.status(404).json({
                message: "Code solution not found."
            });
        }

        const [steps] = await db.query(
            `SELECT
                id,
                solution_id,
                step_number,
                step_title,
                step_description,
                step_type,
                code_line_start,
                code_line_end,
                created_at,
                updated_at
             FROM student_code_algorithm_steps
             WHERE solution_id = ?
             ORDER BY step_number ASC`,
            [solutionId]
        );

        return res.status(200).json({
            message: "Algorithm steps retrieved successfully.",
            solution_id: Number(solutionId),
            total_steps: steps.length,
            steps
        });
    } catch (error) {
        console.error("Get algorithm steps error:", error);

        return res.status(500).json({
            message: "Failed to retrieve algorithm steps."
        });
    }
};



const updateAlgorithmStep = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can update algorithm steps."
            });
        }

        const { solutionId, stepId } = req.params;
        const {
            step_number,
            step_title,
            step_description,
            step_type,
            code_line_start,
            code_line_end
        } = req.body;

        const allowedTypes = [
            "start",
            "input",
            "process",
            "condition",
            "output",
            "loop",
            "end"
        ];

        if (
            !Number.isInteger(Number(step_number)) ||
            Number(step_number) < 1
        ) {
            return res.status(400).json({
                message: "A valid step number is required."
            });
        }

        if (!allowedTypes.includes(step_type)) {
            return res.status(400).json({
                message: "Invalid algorithm step type."
            });
        }

        if (
            code_line_start != null &&
            (!Number.isInteger(Number(code_line_start)) ||
                Number(code_line_start) < 1)
        ) {
            return res.status(400).json({
                message: "Code start line must be a positive integer."
            });
        }

        if (
            code_line_end != null &&
            (!Number.isInteger(Number(code_line_end)) ||
                Number(code_line_end) < 1)
        ) {
            return res.status(400).json({
                message: "Code end line must be a positive integer."
            });
        }

        if (
            code_line_start != null &&
            code_line_end != null &&
            Number(code_line_end) < Number(code_line_start)
        ) {
            return res.status(400).json({
                message: "Code end line cannot be before the start line."
            });
        }

     
const [steps] = await db.query(
    `SELECT a.id, a.step_number, s.student_id
     FROM student_code_algorithm_steps a
     JOIN student_code_solutions s
         ON s.id = a.solution_id
     WHERE a.id = ? AND a.solution_id = ?`,
    [stepId, solutionId]
);

if (steps.length === 0) {
    return res.status(404).json({
        message: "Algorithm step not found."
    });
}

if (Number(steps[0].student_id) !== Number(req.user.id)) {
    return res.status(403).json({
        message: "You can only edit steps in your own solutions."
    });
}


        if (Number(steps[0].student_id) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "You can only edit steps in your own solutions."
            });
        }

        await db.query(
            `UPDATE student_code_algorithm_steps
             SET step_number = ?,
                 step_title = ?,
                 step_description = ?,
                 step_type = ?,
                 code_line_start = ?,
                 code_line_end = ?
             WHERE id = ? AND solution_id = ?`,
            [
                Number(step_number),
                step_title || null,
                step_description || null,
                step_type,
                code_line_start == null ? null : Number(code_line_start),
                code_line_end == null ? null : Number(code_line_end),
                stepId,
                solutionId
            ]
        );

        return res.status(200).json({
            message: "Algorithm step updated successfully."
        });
    } catch (error) {
        console.error("Update algorithm step error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "That step number is already in use."
            });
        }

        return res.status(500).json({
            message: "Failed to update algorithm step."
        });
    }
};


const deleteAlgorithmStep = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can delete algorithm steps."
            });
        }

        const { solutionId, stepId } = req.params;

        const [steps] = await db.query(
            `SELECT a.id, s.student_id
             FROM student_code_algorithm_steps a
             JOIN student_code_solutions s
                 ON s.id = a.solution_id
             WHERE a.id = ? AND a.solution_id = ?`,
            [stepId, solutionId]
        );

        if (steps.length === 0) {
            return res.status(404).json({
                message: "Algorithm step not found."
            });
        }

        if (Number(steps[0].student_id) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "You can only delete steps from your own solutions."
            });
        }

        await db.query(
            `DELETE FROM student_code_algorithm_steps
             WHERE id = ? AND solution_id = ?`,
            [stepId, solutionId]
        );

        return res.status(200).json({
            message: "Algorithm step deleted successfully."
        });
    } catch (error) {
        console.error("Delete algorithm step error:", error);

        return res.status(500).json({
            message: "Failed to delete algorithm step."
        });
    }
};


module.exports = {
    
    createAlgorithmSteps,
    getAlgorithmSteps,
    updateAlgorithmStep,
    deleteAlgorithmStep
};
