
// =====================================================
// IMPORT DATABASE
// =====================================================

const db = require("../../../../config/db");


// =====================================================
// GET STUDENT PROBLEM DETAILS
// =====================================================

const getStudentProblemDetails = async (req, res) => {

    try {

        // -------------------------------------------------
        // GET PROBLEM ID
        // -------------------------------------------------

        const { problemId } = req.params;

        const parsedProblemId = Number(problemId);

        if (
            !Number.isInteger(parsedProblemId) ||
            parsedProblemId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID"
            });
        }


        // -------------------------------------------------
        // FETCH PUBLISHED PROBLEM
        // -------------------------------------------------

        const [problemRows] = await db.query(
            `
            SELECT
                p.id,
                p.title,
                p.description,
                p.difficulty,
                p.solution_unlock,
                p.created_at,
                u.name AS mentor_name

            FROM logic_to_code_problems p

            JOIN users u
                ON p.mentor_id = u.id

            WHERE p.id = ?
            AND p.status = 'published'
            `,
            [parsedProblemId]
        );

        if (problemRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        const problem = problemRows[0];


        // -------------------------------------------------
        // FETCH LOGIC STEPS
        // -------------------------------------------------

        const [steps] = await db.query(
            `
            SELECT
                id,
                step_number,
                step_description

            FROM logic_to_code_steps

            WHERE problem_id = ?

            ORDER BY step_number ASC
            `,
            [parsedProblemId]
        );


        // -------------------------------------------------
        // FETCH SAMPLE CODE AND STARTER CODE
        // -------------------------------------------------

        const [supportRows] = await db.query(
            `
            SELECT
                sample_code_title,
                sample_code_description,
                sample_code,
                sample_code_language,
                starter_code,
                starter_code_language

            FROM logic_to_code_support

            WHERE problem_id = ?
            `,
            [parsedProblemId]
        );


        // -------------------------------------------------
        // FETCH HINTS
        // -------------------------------------------------

        const [hints] = await db.query(
            `
            SELECT
                id,
                hint_number,
                hint_content

            FROM logic_to_code_hints

            WHERE problem_id = ?

            ORDER BY hint_number ASC
            `,
            [parsedProblemId]
        );


        // -------------------------------------------------
        // FETCH COMMON MISTAKES
        // -------------------------------------------------

        const [mistakes] = await db.query(
            `
            SELECT
                id,
                mistake_title,
                mistake_description

            FROM logic_to_code_mistakes

            WHERE problem_id = ?

            ORDER BY id ASC
            `,
            [parsedProblemId]
        );


        // -------------------------------------------------
        // FETCH PUBLIC TEST CASES ONLY
        // -------------------------------------------------

        const [testCases] = await db.query(
            `
            SELECT
                id,
                case_number,
                test_input,
                expected_output

            FROM logic_to_code_test_cases

            WHERE problem_id = ?
            AND visibility = 'public'

            ORDER BY case_number ASC
            `,
            [parsedProblemId]
        );


        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message: "Problem details fetched successfully",

            data: {

                problem,

                steps,

                support: supportRows[0] || null,

                hints,

                mistakes,

                publicTestCases: testCases

            }

        });

    } catch (error) {

        console.error(
            "Get Student Problem Details Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch problem details"
        });

    }

};


// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {
    getStudentProblemDetails
};
