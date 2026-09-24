//This controller will handle student subject selection.
// Handles student subject selection

const db = require("../config/db");


// Get subjects available for the student's education year
const getAvailableSubjects = (req, res) => {

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
        ORDER BY s.name ASC
    `;

    db.query(
        sql,
        [req.user.id],
        (err, result) => {

            if (err) {

                console.error(
                    "Available subjects fetch failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to fetch available subjects"
                });
            }

            res.status(200).json({
                subjects: result
            });
        }
    );
};


// Select a subject only if it belongs to the student's education year
const selectSubject = (req, res) => {

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

    db.query(
        sql,
        [subject_id, req.user.id],
        (err, result) => {

            if (err) {

                // Student already selected this subject
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

            // No row means the subject does not belong
            // to the student's education year
            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: "Subject is not available for your education year"
                });
            }

            res.status(201).json({
                message: "Subject selected successfully",
                studentSubjectId: result.insertId
            });
        }
    );
};

// Get subjects already selected by the authenticated student
const getSelectedSubjects = (req, res) => {

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

    db.query(
        sql,
        [req.user.id],
        (err, result) => {

            if (err) {
                console.error(
                    "Selected subjects fetch failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to fetch selected subjects"
                });
            }

            res.status(200).json({
                subjects: result
            });
        }
    );
};

// Remove a selected subject from the authenticated student
const removeSubject = (req, res) => {

    const { subjectId } = req.params;

    const sql = `
        DELETE FROM student_subjects
        WHERE student_id = ?
          AND subject_id = ?
    `;

    db.query(
        sql,
        [req.user.id, subjectId],
        (err, result) => {

            if (err) {
                console.error(
                    "Subject removal failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to remove subject"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Selected subject not found"
                });
            }

            res.status(200).json({
                message: "Subject removed successfully"
            });
        }
    );
};

module.exports = {
    getAvailableSubjects,
    getSelectedSubjects,
    selectSubject,
    removeSubject,
};