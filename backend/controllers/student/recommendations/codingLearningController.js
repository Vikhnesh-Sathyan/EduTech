const db = require("../../../config/db");

//Hightlight and algorithm steps
const createCodeHighlight = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can highlight code."
            });
        }

        const solutionId = Number(req.params.solutionId);

        if (!Number.isInteger(solutionId) || solutionId <= 0) {
            return res.status(400).json({
                message: "Invalid solution ID."
            });
        }

        const {
            start_line,
            end_line,
            highlight_color,
            explanation
        } = req.body;

        const startLine = Number(start_line);
        const endLine = Number(end_line);

        if (
            !Number.isInteger(startLine) ||
            !Number.isInteger(endLine) ||
            startLine <= 0 ||
            endLine < startLine
        ) {
            return res.status(400).json({
                message: "Enter a valid line range."
            });
        }

        if (!explanation?.trim()) {
            return res.status(400).json({
                message: "Highlight explanation is required."
            });
        }

        const color = highlight_color || "#ef4444";

        if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
            return res.status(400).json({
                message: "Enter a valid hexadecimal highlight color."
            });
        }

      
const [solutions] = await db.query(
    `SELECT id, post_id, student_id, code
     FROM student_code_solutions
     WHERE id = ?`,
    [solutionId]
);

if (solutions.length === 0) {
    return res.status(404).json({
        message: "Code solution not found."
    });
}
// console.log('Logged-in user ID:', req.user.id);
// console.log('Solution owner ID:', solutions[0].student_id);
// console.log('Solution ID:', solutionId);
if (Number(solutions[0].student_id) !== Number(req.user.id)) {
    return res.status(403).json({
        message: "You can only highlight code in your own solutions."
    });
}


        const totalLines = solutions[0].code.split("\n").length;

        if (endLine > totalLines) {
            return res.status(400).json({
                message: `The code contains only ${totalLines} lines.`
            });
        }

        const [result] = await db.query(
            `INSERT INTO student_code_highlights
            (
                solution_id,
                start_line,
                end_line,
                highlight_color,
                explanation
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                solutionId,
                startLine,
                endLine,
                color,
                explanation.trim()
            ]
        );

        return res.status(201).json({
            message: "Code highlight created successfully.",
            id: result.insertId
        });
    } catch (error) {
        console.error("Create code highlight error:", error);

        return res.status(500).json({
            message: "Failed to create code highlight."
        });
    }
};


// ==========================================
// GET CODE HIGHLIGHTS
// ==========================================

const getCodeHighlights = async (req, res) => {
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

        const [highlights] = await db.query(
            `SELECT
                id,
                solution_id,
                start_line,
                end_line,
                highlight_color,
                explanation,
                created_at,
                updated_at
             FROM student_code_highlights
             WHERE solution_id = ?
             ORDER BY start_line ASC, id ASC`,
            [solutionId]
        );

        return res.status(200).json({
            message: "Code highlights retrieved successfully.",
            solution_id: Number(solutionId),
            total_highlights: highlights.length,
            highlights
        });
    } catch (error) {
        console.error("Get code highlights error:", error);

        return res.status(500).json({
            message: "Failed to retrieve code highlights."
        });
    }
};

// ==========================================
// UPDATE A CODE HIGHLIGHT
// ==========================================


const updateCodeHighlight = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can update code highlights."
            });
        }

        const solutionId = Number(req.params.solutionId);
        const highlightId = Number(req.params.highlightId);

        if (
            !Number.isInteger(solutionId) ||
            solutionId <= 0 ||
            !Number.isInteger(highlightId) ||
            highlightId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid solution or highlight ID."
            });
        }

        const {
            start_line,
            end_line,
            highlight_color,
            explanation
        } = req.body;

        const startLine = Number(start_line);
        const endLine = Number(end_line);

        if (
            start_line == null ||
            end_line == null ||
            !Number.isInteger(startLine) ||
            !Number.isInteger(endLine) ||
            startLine < 1 ||
            endLine < startLine
        ) {
            return res.status(400).json({
                message: "Valid start_line and end_line are required."
            });
        }

        if (
            typeof explanation !== "string" ||
            !explanation.trim()
        ) {
            return res.status(400).json({
                message: "An explanation is required."
            });
        }

        if (
            highlight_color != null &&
            (
                typeof highlight_color !== "string" ||
                !/^#[0-9a-fA-F]{6}$/.test(highlight_color)
            )
        ) {
            return res.status(400).json({
                message: "Highlight color must be a valid hexadecimal color."
            });
        }

        const color = highlight_color || "#ef4444";

        const [rows] = await db.query(
            `SELECT h.id, cs.code
             FROM student_code_highlights h
             JOIN student_code_solutions cs
                 ON cs.id = h.solution_id
             JOIN student_code_posts p
                 ON p.id = cs.post_id
             JOIN subjects s
                 ON s.id = p.subject_id
             WHERE h.id = ?
               AND h.solution_id = ?
               AND cs.student_id = ?
               AND p.status = 'published'
               AND s.status = 'active'`,
            [highlightId, solutionId, req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Highlight not found or you cannot edit it."
            });
        }

        const totalLines = rows[0].code.split("\n").length;

        if (endLine > totalLines) {
            return res.status(400).json({
                message: `The code contains only ${totalLines} lines.`
            });
        }

        await db.query(
            `UPDATE student_code_highlights
             SET start_line = ?,
                 end_line = ?,
                 highlight_color = ?,
                 explanation = ?
             WHERE id = ? AND solution_id = ?`,
            [
                startLine,
                endLine,
                color,
                explanation.trim(),
                highlightId,
                solutionId
            ]
        );

        return res.status(200).json({
            message: "Code highlight updated successfully."
        });
    } catch (error) {
        console.error("Update code highlight error:", error);

        return res.status(500).json({
            message: "Failed to update code highlight."
        });
    }
};


module.exports.updateCodeHighlight = updateCodeHighlight;



const deleteCodeHighlight = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can delete code highlights."
            });
        }

        const solutionId = Number(req.params.solutionId);
        const highlightId = Number(req.params.highlightId);

        if (
            !Number.isInteger(solutionId) ||
            solutionId <= 0 ||
            !Number.isInteger(highlightId) ||
            highlightId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid solution or highlight ID."
            });
        }

        const [highlights] = await db.query(
            `SELECT h.id
             FROM student_code_highlights h
             JOIN student_code_solutions cs
                 ON cs.id = h.solution_id
             WHERE h.id = ?
               AND h.solution_id = ?
               AND cs.student_id = ?`,
            [highlightId, solutionId, req.user.id]
        );

        if (highlights.length === 0) {
            return res.status(404).json({
                message: "Highlight not found or you cannot delete it."
            });
        }

        await db.query(
            `DELETE FROM student_code_highlights
             WHERE id = ? AND solution_id = ?`,
            [highlightId, solutionId]
        );

        return res.status(200).json({
            message: "Code highlight deleted successfully."
        });
    } catch (error) {
        console.error("Delete code highlight error:", error);

        return res.status(500).json({
            message: "Failed to delete code highlight."
        });
    }
};


module.exports = {
    createCodeHighlight,
    updateCodeHighlight,
    deleteCodeHighlight,
    getCodeHighlights,
};
