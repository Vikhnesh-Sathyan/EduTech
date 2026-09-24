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


// Select a subject for the authenticated student
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
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [req.user.id, subject_id],
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

            res.status(201).json({
                message: "Subject selected successfully",
                studentSubjectId: result.insertId
            });
        }
    );
};


module.exports = {
    getAvailableSubjects,
    selectSubject
};