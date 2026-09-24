// Handles admin management of education programs

const db = require("../config/db");


// Create a new education program
const createEducationProgram = (req, res) => {

    const { name, description } = req.body;

    // Validate required program name
    if (!name || !name.trim()) {
        return res.status(400).json({
            message: "Education program name is required"
        });
    }

    const sql = `
        INSERT INTO education_programs
        (name, description)
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [name.trim(), description || null],
        (err, result) => {

            if (err) {

                // Handle duplicate program name
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Education program already exists"
                    });
                }

                console.error(
                    "Education program creation failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to create education program"
                });
            }

            res.status(201).json({
                message: "Education program created successfully",
                programId: result.insertId
            });
        }
    );
};


// Get all education programs
const getEducationPrograms = (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            description,
            status,
            created_at,
            updated_at
        FROM education_programs
        ORDER BY name ASC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.error(
                "Education programs fetch failed:",
                err.message
            );

            return res.status(500).json({
                message: "Failed to fetch education programs"
            });
        }

        res.status(200).json({
            programs: result
        });
    });
};


// Update an education program
const updateEducationProgram = (req, res) => {

    const { id } = req.params;
    const { name, description } = req.body;

    // Validate required program name
    if (!name || !name.trim()) {
        return res.status(400).json({
            message: "Education program name is required"
        });
    }

    const sql = `
        UPDATE education_programs
        SET
            name = ?,
            description = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name.trim(), description || null, id],
        (err, result) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Education program already exists"
                    });
                }

                console.error(
                    "Education program update failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to update education program"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Education program not found"
                });
            }

            res.status(200).json({
                message: "Education program updated successfully"
            });
        }
    );
};


// Activate or deactivate an education program
const updateEducationProgramStatus = (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    // Validate the requested status
    if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
            message: "Status must be active or inactive"
        });
    }

    const sql = `
        UPDATE education_programs
        SET status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [status, id],
        (err, result) => {

            if (err) {

                console.error(
                    "Education program status update failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to update education program status"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Education program not found"
                });
            }

            res.status(200).json({
                message: "Education program status updated successfully"
            });
        }
    );
};


module.exports = {
    createEducationProgram,
    getEducationPrograms,
    updateEducationProgram,
    updateEducationProgramStatus
};