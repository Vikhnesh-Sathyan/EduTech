// Handles admin management of subjects

const db = require("../config/db");


// Create a subject under an education year
const createSubject = (req, res) => {

    const {
        education_year_id,
        name,
        description
    } = req.body;

    // Validate required subject data
    if (
        !education_year_id ||
        !name ||
        !name.trim()
    ) {
        return res.status(400).json({
            message: "Education year and subject name are required"
        });
    }

    const sql = `
        INSERT INTO subjects
        (education_year_id, name, description)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            education_year_id,
            name.trim(),
            description || null
        ],
        (err, result) => {

            if (err) {

                // Handle duplicate subject name
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Subject already exists for this education year"
                    });
                }

                console.error(
                    "Subject creation failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to create subject"
                });
            }

            res.status(201).json({
                message: "Subject created successfully",
                subjectId: result.insertId
            });
        }
    );
};


// Get subjects for an education year
const getSubjectsByYear = (req, res) => {

    const { yearId } = req.params;

    const sql = `
        SELECT
            id,
            education_year_id,
            name,
            description,
            status,
            created_at,
            updated_at
        FROM subjects
        WHERE education_year_id = ?
        ORDER BY name ASC
    `;

    db.query(
        sql,
        [yearId],
        (err, result) => {

            if (err) {

                console.error(
                    "Subjects fetch failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to fetch subjects"
                });
            }

            res.status(200).json({
                subjects: result
            });
        }
    );
};


// Update a subject
const updateSubject = (req, res) => {

    const { id } = req.params;

    const {
        name,
        description
    } = req.body;

    // Validate required subject name
    if (!name || !name.trim()) {
        return res.status(400).json({
            message: "Subject name is required"
        });
    }

    const sql = `
        UPDATE subjects
        SET
            name = ?,
            description = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            name.trim(),
            description || null,
            id
        ],
        (err, result) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Subject already exists for this education year"
                    });
                }

                console.error(
                    "Subject update failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to update subject"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Subject not found"
                });
            }

            res.status(200).json({
                message: "Subject updated successfully"
            });
        }
    );
};


// Activate or deactivate a subject
const updateSubjectStatus = (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    // Validate the requested status
    if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
            message: "Status must be active or inactive"
        });
    }

    const sql = `
        UPDATE subjects
        SET status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [status, id],
        (err, result) => {

            if (err) {

                console.error(
                    "Subject status update failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to update subject status"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Subject not found"
                });
            }

            res.status(200).json({
                message: "Subject status updated successfully"
            });
        }
    );
};


module.exports = {
    createSubject,
    getSubjectsByYear,
    updateSubject,
    updateSubjectStatus
};