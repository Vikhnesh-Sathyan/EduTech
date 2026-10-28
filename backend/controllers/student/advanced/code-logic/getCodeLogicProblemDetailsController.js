
const db = require("../../../../config/db");

// =====================================================
// GET ONE PUBLISHED LOGIC TO CODE PROBLEM
// =====================================================

const getProblemDetails = async (req, res) => {
    try {
        const problemId = Number(req.params.problemId);

        // 1. VALIDATE PROBLEM ID
        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
            });
        }

        // 2. FETCH PUBLISHED PROBLEM
        const [problems] = await db.execute(
            `SELECT
                p.id,
                p.title,
                p.description,
                p.mode,
                p.difficulty,
                p.max_marks,
                p.publish_date,
                p.due_date,
                p.language_id,
                s.name AS language_name,
                c.input_description,
                c.output_description,
                c.examples,
                c.starter_code,
                c.algorithm_steps,
                c.flow_data,
                c.prediction_questions
            FROM code_logic_problems p
            INNER JOIN subjects s
                ON p.language_id = s.id
            LEFT JOIN code_logic_problem_content c
                ON p.id = c.problem_id
            WHERE p.id = ?
                AND p.status = 'published'
                AND (
                    p.publish_date IS NULL
                    OR p.publish_date <= NOW()
                )
                AND (
                    p.due_date IS NULL
                    OR p.due_date >= NOW()
                )
            LIMIT 1`,
            [problemId]
        );

        if (problems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Published problem not found."
            });
        }

        const problem = problems[0];

        // 3. PARSE JSON FIELDS
        const parseJson = (value) => {
            if (value === null || value === undefined) {
                return null;
            }

            if (typeof value !== "string") {
                return value;
            }

            try {
                return JSON.parse(value);
            } catch {
                return null;
            }
        };

        problem.examples = parseJson(problem.examples);

        problem.algorithm_steps = parseJson(
            problem.algorithm_steps
        );

        problem.flow_data = parseJson(problem.flow_data);

        problem.prediction_questions = parseJson(
            problem.prediction_questions
        );

        // 4. HIDE EXPECTED ANSWERS FROM STUDENTS
        if (Array.isArray(problem.prediction_questions)) {
            problem.prediction_questions =
                problem.prediction_questions.map((question) => ({
                    question: question.question,
                    marks: question.marks
                }));
        } else {
            problem.prediction_questions = [];
        }

        // 5. RETURN SAFE PROBLEM DETAILS
        return res.status(200).json({
            success: true,
            problem
        });

    } catch (error) {
        console.error(
            "Get Logic to Code problem details error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch problem details."
        });
    }
};

module.exports = {
    getProblemDetails
};
