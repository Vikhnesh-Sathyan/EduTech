const db = require("../../../config/db");

//code solutions
const createCodeSolution = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can add code solutions."
            });
        }

        const postId = Number(req.params.id);

        if (!Number.isInteger(postId) || postId <= 0) {
            return res.status(400).json({
                message: "Invalid coding question ID."
            });
        }

        const {
            solution_title,
            programming_language,
            code,
            algorithm_explanation,
            time_complexity,
            space_complexity
        } = req.body;

       
if (
    typeof programming_language !== "string" ||
    !programming_language.trim() ||
    typeof code !== "string" ||
    !code.trim()
) {
    return res.status(400).json({
        message: "Programming language and code are required."
    });
}

if (
    solution_title != null &&
    (
        typeof solution_title !== "string" ||
        solution_title.trim().length > 200
    )
) {
    return res.status(400).json({
        message: "Solution title must be text and cannot exceed 200 characters."
    });
}

for (const [field, value] of [
    ["algorithm_explanation", algorithm_explanation],
    ["time_complexity", time_complexity],
    ["space_complexity", space_complexity]
]) {
    if (value != null && typeof value !== "string") {
        return res.status(400).json({
            message: `${field} must be text.`
        });
    }
}


        if (programming_language.trim().length > 50) {
            return res.status(400).json({
                message: "Programming language cannot exceed 50 characters."
            });
        }

        if (
            solution_title &&
            solution_title.trim().length > 200
        ) {
            return res.status(400).json({
                message: "Solution title cannot exceed 200 characters."
            });
        }

        const [posts] = await db.query(
            `SELECT id
             FROM student_code_posts
             WHERE id = ? AND status = 'published'`,
            [postId]
        );

        if (posts.length === 0) {
            return res.status(404).json({
                message: "Published coding question not found."
            });
        }

        const [result] = await db.query(
            `INSERT INTO student_code_solutions
            (
                post_id,
                student_id,
                solution_title,
                programming_language,
                code,
                algorithm_explanation,
                time_complexity,
                space_complexity
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                postId,
                req.user.id,
                solution_title?.trim() || null,
                programming_language.trim(),
                code,
                algorithm_explanation?.trim() || null,
                time_complexity?.trim() || null,
                space_complexity?.trim() || null
            ]
        );

        return res.status(201).json({
            message: "Code solution added successfully.",
            id: result.insertId
        });
    } catch (error) {
        console.error("Create code solution error:", error);

        return res.status(500).json({
            message: "Failed to add code solution."
        });
    }
};


// ==========================================
// UPDATE MY CODING SOLUTION
// ==========================================

const updateCodeSolution = async (req, res) => {
    try {
        const { solutionId } = req.params;

        const {
            solution_title,
            programming_language,
            code,
            algorithm_explanation,
            time_complexity,
            space_complexity
        } = req.body;

        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can update coding solutions."
            });
        }

        if (
            typeof programming_language !== "string" ||
            !programming_language.trim() ||
            typeof code !== "string" ||
            !code.trim()
        ) {
            return res.status(400).json({
                message: "Programming language and code are required."
            });
        }

        if (
            programming_language.trim().length > 50 ||
            code.length > 1000000
        ) {
            return res.status(400).json({
                message: "Programming language or code exceeds the allowed length."
            });
        }

        if (
            solution_title != null &&
            (
                typeof solution_title !== "string" ||
                solution_title.length > 200
            )
        ) {
            return res.status(400).json({
                message: "Solution title must be a string of at most 200 characters."
            });
        }
        
for (const [field, value] of [
    ["algorithm_explanation", algorithm_explanation],
    ["time_complexity", time_complexity],
    ["space_complexity", space_complexity]
]) {
    if (value != null && typeof value !== "string") {
        return res.status(400).json({
            message: `${field} must be text.`
        });
    }
}

if (
    solution_title != null &&
    solution_title.trim().length > 200
) {
    return res.status(400).json({
        message: "Solution title cannot exceed 200 characters."
    });
}

        const [solutions] = await db.query(
            `SELECT
                cs.id,
                cs.student_id,
                cs.version,
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
                message: "Coding solution not found."
            });
        }

        const solution = solutions[0];

        if (Number(solution.student_id) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "You can only update your own coding solution."
            });
        }

        if (
            solution.post_status !== "published" ||
            solution.subject_status !== "active"
        ) {
            return res.status(400).json({
                message: "This coding solution cannot be updated right now."
            });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const nextVersion = Number(solution.version) + 1;

            await connection.query(
                `UPDATE student_code_solutions
                 SET solution_title = ?,
                     programming_language = ?,
                     code = ?,
                     algorithm_explanation = ?,
                     time_complexity = ?,
                     space_complexity = ?,
                     version = ?
                 WHERE id = ? AND student_id = ?`,
                [
                    solution_title?.trim() || null,
                    programming_language.trim(),
                    code,
                    algorithm_explanation ?? null,
                    time_complexity ?? null,
                    space_complexity ?? null,
                    nextVersion,
                    solutionId,
                    req.user.id
                ]
            );

            await connection.commit();

            return res.status(200).json({
                message: "Coding solution updated successfully.",
                solution_id: Number(solutionId),
                version: nextVersion
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Update code solution error:", error);

        return res.status(500).json({
            message: "Failed to update coding solution."
        });
    }
};

module.exports.updateCodeSolution = updateCodeSolution;

// ==========================================
// GET SOLUTIONS FOR A CODING QUESTION
// ==========================================

const getCodeSolutions = async (req, res) => {
    try {
        const postId = Number(req.params.postId);

if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({
        message: "Invalid coding question ID."
    });
}

        const [posts] = await db.query(
            `SELECT p.id
             FROM student_code_posts p
             INNER JOIN subjects s
                ON s.id = p.subject_id
             WHERE p.id = ?
               AND p.status = 'published'
               AND s.status = 'active'`,
            [postId]
        );

        if (posts.length === 0) {
            return res.status(404).json({
                message: "Coding question not found."
            });
        }

        const [solutions] = await db.query(
            `SELECT
                cs.id AS solution_id,
                cs.post_id,
                u.name AS student_name,
                cs.solution_title,
                cs.programming_language,
                cs.code,
                cs.algorithm_explanation,
                cs.time_complexity,
                cs.space_complexity,
                cs.version,
                cs.created_at,
                cs.updated_at,
                (
                    SELECT COUNT(*)
                    FROM student_code_highlights h
                    WHERE h.solution_id = cs.id
                ) AS highlight_count,
                (
                    SELECT COUNT(*)
                    FROM student_code_algorithm_steps a
                    WHERE a.solution_id = cs.id
                ) AS algorithm_step_count,
                (
                    SELECT COUNT(*)
                    FROM student_code_test_cases tc
                    WHERE tc.solution_id = cs.id
                ) AS test_case_count
             FROM student_code_solutions cs
             INNER JOIN users u
                ON u.id = cs.student_id
             WHERE cs.post_id = ?
             ORDER BY cs.created_at ASC, cs.id ASC`,
            [postId]
        );

        return res.status(200).json({
            message: "Coding solutions retrieved successfully.",
            post_id: Number(postId),
            total_solutions: solutions.length,
            solutions
        });
    } catch (error) {
        console.error("Get code solutions error:", error);

        return res.status(500).json({
            message: "Failed to retrieve coding solutions."
        });
    }
};

module.exports.getCodeSolutions = getCodeSolutions;


module.exports = {
    createCodeSolution,
    updateCodeSolution,
    getCodeSolutions
};
