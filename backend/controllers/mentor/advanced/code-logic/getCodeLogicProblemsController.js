
const db = require("../../../../config/db");

// =====================================================
// GET ALL PROBLEMS CREATED BY THE LOGGED-IN MENTOR
// =====================================================

const getMyProblems = async (req, res) => {
    try {
        const mentorId = Number(req.user?.id);

        if (!Number.isInteger(mentorId) || mentorId <= 0) {
            return res.status(401).json({
                message: "Invalid mentor authentication."
            });
        }

        const [problems] = await db.execute(
            `SELECT
                p.id,
                p.title,
                p.description,
                p.language_id,
                s.name AS language_name,
                p.mode,
                p.difficulty,
                p.max_marks,
                p.publish_date,
                p.due_date,
                p.status,
                p.created_at,
                p.updated_at
             FROM code_logic_problems p
             INNER JOIN subjects s
                ON s.id = p.language_id
             WHERE p.mentor_id = ?
             ORDER BY p.created_at DESC`,
            [mentorId]
        );

        return res.status(200).json({
            count: problems.length,
            problems
        });

    } catch (error) {
        console.error(
            "Fetch mentor Logic to Code problems error:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch your Logic to Code problems."
        });
    }
};

// =====================================================
// GET ONE PROBLEM WITH FULL CONTENT
// =====================================================

const getProblemById = async (req, res) => {
    try {
        const mentorId = Number(req.user?.id);
        const problemId = Number(req.params.problemId);

        // 1. Validate mentor authentication
        if (!Number.isInteger(mentorId) || mentorId <= 0) {
            return res.status(401).json({
                message: "Invalid mentor authentication."
            });
        }

        // 2. Validate problem ID
        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                message: "Invalid problem ID."
            });
        }

        // 3. Fetch only this mentor's problem
        const [problems] = await db.execute(
            `SELECT
                p.id,
                p.mentor_id,
                p.language_id,
                s.name AS language_name,
                p.title,
                p.description,
                p.mode,
                p.difficulty,
                p.max_marks,
                p.hint_text,
                p.publish_date,
                p.due_date,
                p.status,
                p.created_at,
                p.updated_at,
                c.input_description,
                c.output_description,
                c.examples,
                c.starter_code,
                c.solution_code,
                c.algorithm_steps,
                c.flow_data,
                c.prediction_questions
             FROM code_logic_problems p
             INNER JOIN subjects s
                ON s.id = p.language_id
             LEFT JOIN code_logic_problem_content c
                ON c.problem_id = p.id
             WHERE p.id = ?
               AND p.mentor_id = ?
             LIMIT 1`,
            [problemId, mentorId]
        );

        if (problems.length === 0) {
            return res.status(404).json({
                message:
                    "Problem not found or you do not have permission to access it."
            });
        }

        return res.status(200).json({
            problem: problems[0]
        });

    } catch (error) {
        console.error(
            "Fetch Logic to Code problem error:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch the problem."
        });
    }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    getMyProblems,
    getProblemById
};
