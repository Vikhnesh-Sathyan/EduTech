// Handles student subject selection

const db = require("../../config/db");


// ==========================================
// GET AVAILABLE SUBJECTS
// ==========================================

// Get subjects available for the student's education year
const getAvailableSubjects = async (req, res) => {

    const sql = `
        SELECT
            s.id,
            s.name,
            s.description,
            s.status
        FROM student_profiles sp
        INNER JOIN subjects s
            ON s.education_year_id = sp.education_year_id
        WHERE sp.user_id = ?
          AND s.status = 'active'
          AND NOT EXISTS (
              SELECT 1
              FROM student_subjects ss
              WHERE ss.student_id = sp.user_id
                AND ss.subject_id = s.id
          )
        ORDER BY s.name ASC
    `;

    try {

        const [result] = await db.query(
            sql,
            [req.user.id]
        );

        res.status(200).json({
            subjects: result
        });

    } catch (err) {

        console.error(
            "Available subjects fetch failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to fetch available subjects"
        });
    }
};


// ==========================================
// SELECT SUBJECT
// ==========================================

// Select a subject only if it belongs to
// the student's education year
const selectSubject = async (req, res) => {

    const { subject_id } = req.body;

    // Validate the selected subject
    if (!subject_id) {
        return res.status(400).json({
            message: "Subject is required"
        });
    }

    const sql = `
        INSERT INTO student_subjects
        (student_id, subject_id)
        SELECT
            sp.user_id,
            s.id
        FROM student_profiles sp
        INNER JOIN subjects s
            ON s.id = ?
            AND s.education_year_id = sp.education_year_id
            AND s.status = 'active'
        WHERE sp.user_id = ?
    `;

    try {

        const [result] = await db.query(
            sql,
            [subject_id, req.user.id]
        );

        // Student already selected this subject
        if (result.affectedRows === 0) {
            return res.status(400).json({
                message:
                    "Subject is not available for your education year"
            });
        }

        res.status(201).json({
            message: "Subject selected successfully",
            studentSubjectId: result.insertId
        });

    } catch (err) {

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Subject already selected"
            });
        }

        console.error(
            "Subject selection failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to select subject"
        });
    }
};


// ==========================================
// GET SELECTED SUBJECTS
// ==========================================

// Get subjects already selected by the authenticated student
const getSelectedSubjects = async (req, res) => {

    const sql = `
        SELECT
            ss.id,
            s.id AS subject_id,
            s.name,
            s.description
        FROM student_subjects ss
        INNER JOIN subjects s
            ON s.id = ss.subject_id
        WHERE ss.student_id = ?
        ORDER BY s.name ASC
    `;

    try {

        const [result] = await db.query(
            sql,
            [req.user.id]
        );

        res.status(200).json({
            subjects: result
        });

    } catch (err) {

        console.error(
            "Selected subjects fetch failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to fetch selected subjects"
        });
    }
};


// ==========================================
// REMOVE SUBJECT
// ==========================================

// Remove a selected subject from the authenticated student
const removeSubject = async (req, res) => {

    const { subjectId } = req.params;

    const sql = `
        DELETE FROM student_subjects
        WHERE student_id = ?
          AND subject_id = ?
    `;

    try {

        const [result] = await db.query(
            sql,
            [req.user.id, subjectId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Selected subject not found"
            });
        }

        res.status(200).json({
            message: "Subject removed successfully"
        });

    } catch (err) {

        console.error(
            "Subject removal failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to remove subject"
        });
    }
};


module.exports = {
    getAvailableSubjects,
    getSelectedSubjects,
    selectSubject,
    removeSubject
};
