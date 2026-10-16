const db = require("../../../config/db");


const createCodeAnimationSteps = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can create animation steps."
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
                message: "Provide at least one animation step."
            });
        }

        if (steps.length > 500) {
            return res.status(400).json({
                message: "A maximum of 500 animation steps is allowed."
            });
        }

        const allowedActions = [
            "initialize",
            "input",
            "assignment",
            "comparison",
            "loop",
            "output",
            "complete"
        ];

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];

            if (
                typeof step.step_title !== "string" ||
                !step.step_title.trim() ||
                typeof step.explanation !== "string" ||
                !step.explanation.trim()
            ) {
                return res.status(400).json({
                    message: `Animation step ${i + 1} requires a title and explanation.`
                });
            }

            if (
                step.action_type &&
                !allowedActions.includes(step.action_type)
            ) {
                return res.status(400).json({
                    message: `Animation step ${i + 1} has an invalid action type.`
                });
            }

            if (
                step.code_line != null &&
                (
                    !Number.isInteger(Number(step.code_line)) ||
                    Number(step.code_line) <= 0
                )
            ) {
                return res.status(400).json({
                    message: `Animation step ${i + 1} has an invalid code line.`
                });
            }

            if (
                step.variable_state != null &&
                (
                    typeof step.variable_state !== "object" ||
                    Array.isArray(step.variable_state)
                )
            ) {
                return res.status(400).json({
                    message: `Animation step ${i + 1} must have a valid variable state object.`
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
        message: "You can only modify animation steps for your own solutions."
    });
}

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            await connection.query(
                `DELETE FROM student_code_animation_steps
                 WHERE solution_id = ?`,
                [solutionId]
            );

            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];

                await connection.query(
                    `INSERT INTO student_code_animation_steps
                    (
                        solution_id,
                        step_number,
                        code_line,
                        step_title,
                        explanation,
                        variable_state,
                        action_type
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        solutionId,
                        i + 1,
                        step.code_line ?? null,
                        step.step_title.trim(),
                        step.explanation.trim(),
                        step.variable_state == null
                            ? null
                            : JSON.stringify(step.variable_state),
                        step.action_type || "assignment"
                    ]
                );
            }

            await connection.commit();

            return res.status(201).json({
                message: "Code animation steps saved successfully.",
                total_steps: steps.length
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Create code animation steps error:", error);

        return res.status(500).json({
            message: "Failed to save code animation steps."
        });
    }
};

// ==========================================
// GET CODE ANIMATION STEPS
// ==========================================
const getCodeAnimationSteps = async (req, res) => {
    try {
        const { solutionId } = req.params;
        const studentId = req.user.id;

        // Check whether the student can access this solution
        const [solutions] = await db.query(
            `SELECT s.id
             FROM student_code_solutions s
             INNER JOIN student_code_posts p
                ON p.id = s.post_id
             INNER JOIN subjects sub
                ON sub.id = p.subject_id
             WHERE s.id = ?
               AND sub.status = 'active'
               AND (
                    p.status = 'published'
                    OR p.student_id = ?
               )`,
            [solutionId, studentId]
        );

        if (solutions.length === 0) {
            return res.status(404).json({
                message: "Code solution not found or access denied."
            });
        }

        // Retrieve animation steps in playback order
        const [steps] = await db.query(
            `SELECT
                id,
                solution_id,
                step_number,
                code_line,
                step_title,
                explanation,
                variable_state,
                action_type,
                created_at
             FROM student_code_animation_steps
             WHERE solution_id = ?
             ORDER BY step_number ASC`,
            [solutionId]
        );

        return res.status(200).json({
            solution_id: Number(solutionId),
            total_steps: steps.length,
            steps
        });

    } catch (error) {
        console.error("Get code animation steps error:", error);

        return res.status(500).json({
            message: "Failed to retrieve code animation steps."
        });
    }
};

module.exports = {
    createCodeAnimationSteps,
    getCodeAnimationSteps
};
