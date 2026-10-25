
const db = require("../../config/db");

// ==========================================
// GET AVAILABLE SUBJECTS
// ==========================================

const getAvailableSubjects = async (req, res) => {
    const sql = `
        SELECT
            s.id,
            s.name,
            s.description,
            s.status
        FROM student_profiles sp
        INNER JOIN education_years ey
            ON ey.id = sp.education_year_id
        INNER JOIN departments d
            ON d.id = ey.department_id
           AND d.id = sp.department_id
        INNER JOIN education_programs p
            ON p.id = d.education_program_id
           AND p.id = sp.education_program_id
        INNER JOIN subjects s
            ON s.education_year_id = ey.id
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
        const [result] = await db.query(sql, [req.user.id]);

        return res.status(200).json({ subjects: result });
    } catch (err) {
        console.error("Available subjects fetch failed:", err.message);

        return res.status(500).json({
            message: "Failed to fetch available subjects"
        });
    }
};


// ==========================================
// SELECT SUBJECT
// ==========================================

const selectSubject = async (req, res) => {
    const subjectId = Number(req.body.subject_id);

    if (!Number.isInteger(subjectId) || subjectId <= 0) {
        return res.status(400).json({
            message: "A valid subject is required"
        });
    }

    const sql = `
        INSERT INTO student_subjects (student_id, subject_id)
        SELECT sp.user_id, s.id
        FROM student_profiles sp
        INNER JOIN education_years ey
            ON ey.id = sp.education_year_id
        INNER JOIN departments d
            ON d.id = ey.department_id
           AND d.id = sp.department_id
        INNER JOIN education_programs p
            ON p.id = d.education_program_id
           AND p.id = sp.education_program_id
        INNER JOIN subjects s
            ON s.id = ?
           AND s.education_year_id = ey.id
           AND s.status = 'active'
        WHERE sp.user_id = ?
          AND NOT EXISTS (
              SELECT 1
              FROM student_subjects ss
              WHERE ss.student_id = sp.user_id
                AND ss.subject_id = s.id
          )
    `;

    try {
        const [result] = await db.query(sql, [subjectId, req.user.id]);

        if (result.affectedRows === 0) {
            return res.status(409).json({
                message:
                    "This subject is already selected or does not belong to your education year"
            });
        }

        return res.status(201).json({
            message: "Subject selected successfully",
            studentSubjectId: result.insertId
        });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Subject already selected"
            });
        }

        console.error("Subject selection failed:", err.message);

        return res.status(500).json({
            message: "Failed to select subject"
        });
    }
};


// ==========================================
// GET SELECTED SUBJECTS
// ==========================================

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
        INNER JOIN student_profiles sp
            ON sp.user_id = ss.student_id
        WHERE sp.user_id = ?
          AND s.education_year_id = sp.education_year_id
        ORDER BY s.name ASC
    `;

    try {
        const [result] = await db.query(sql, [req.user.id]);

        return res.status(200).json({ subjects: result });
    } catch (err) {
        console.error("Selected subjects fetch failed:", err.message);

        return res.status(500).json({
            message: "Failed to fetch selected subjects"
        });
    }
};


// ==========================================
// REMOVE SUBJECT
// ==========================================

const removeSubject = async (req, res) => {
    const subjectId = Number(req.params.subjectId);

    if (!Number.isInteger(subjectId) || subjectId <= 0) {
        return res.status(400).json({
            message: "A valid subject ID is required"
        });
    }

    const sql = `
        DELETE ss
        FROM student_subjects ss
        INNER JOIN student_profiles sp
            ON sp.user_id = ss.student_id
        INNER JOIN subjects s
            ON s.id = ss.subject_id
        WHERE sp.user_id = ?
          AND s.id = ?
    `;

    try {
        const [result] = await db.query(sql, [req.user.id, subjectId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Selected subject not found"
            });
        }

        return res.status(200).json({
            message: "Subject removed successfully"
        });
    } catch (err) {
        console.error("Subject removal failed:", err.message);

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
