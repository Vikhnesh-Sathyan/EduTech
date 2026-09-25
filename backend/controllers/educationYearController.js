// Handles admin management of education years

const db = require("../config/db");


// Create an education year under a department
const createEducationYear = (req, res) => {

    const {
        department_id,
        name,
        year_order
    } = req.body;

    // Validate required year data
    if (
        !department_id ||
        !name ||
        !name.trim() ||
        !year_order
    ) {
        return res.status(400).json({
            message: "Department, year name and year order are required"
        });
    }

    const sql = `
        INSERT INTO education_years
        (department_id, name, year_order)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            department_id,
            name.trim(),
            year_order
        ],
        (err, result) => {

            if (err) {

                // Handle duplicate year name or order
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Education year already exists for this department"
                    });
                }

                console.error(
                    "Education year creation failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to create education year"
                });
            }

            res.status(201).json({
                message: "Education year created successfully",
                yearId: result.insertId
            });
        }
    );
};


// Get education years for a department
const getEducationYearsByDepartment = (req, res) => {

    const { departmentId } = req.params;

    const sql = `
        SELECT
            id,
            department_id,
            name,
            year_order,
            status,
            created_at,
            updated_at
        FROM education_years
        WHERE department_id = ?
        ORDER BY year_order ASC
    `;

    db.query(
        sql,
        [departmentId],
        (err, result) => {

            if (err) {

                console.error(
                    "Education years fetch failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to fetch education years"
                });
            }

            res.status(200).json({
                years: result
            });
        }
    );
};


// Update an education year
const updateEducationYear = (req, res) => {

    const { id } = req.params;

    const {
        name,
        year_order
    } = req.body;

    // Validate required year data
    if (
        !name ||
        !name.trim() ||
        !year_order
    ) {
        return res.status(400).json({
            message: "Year name and year order are required"
        });
    }

    const sql = `
        UPDATE education_years
        SET
            name = ?,
            year_order = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            name.trim(),
            year_order,
            id
        ],
        (err, result) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Education year already exists for this department"
                    });
                }

                console.error(
                    "Education year update failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to update education year"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Education year not found"
                });
            }

            res.status(200).json({
                message: "Education year updated successfully"
            });
        }
    );
};


// Activate or deactivate an education year
const updateEducationYearStatus = (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    // Validate the requested status
    if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
            message: "Status must be active or inactive"
        });
    }

    const sql = `
        UPDATE education_years
        SET status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [status, id],
        (err, result) => {

            if (err) {

                console.error(
                    "Education year status update failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to update education year status"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Education year not found"
                });
            }

            res.status(200).json({
                message: "Education year status updated successfully"
            });
        }
    );
};
// Get all education years with their department and program names
const getEducationYears = (req, res) => {

    const sql = `
        SELECT
            ey.id,
            ey.department_id,
            ey.name,
            ey.year_order,
            ey.status,
            ey.created_at,
            ey.updated_at,
            d.name AS department_name,
            p.name AS program_name
        FROM education_years ey
        INNER JOIN departments d
            ON d.id = ey.department_id
        INNER JOIN education_programs p
            ON p.id = d.education_program_id
        ORDER BY
            p.name ASC,
            d.name ASC,
            ey.year_order ASC
    `;

    db.query(
        sql,
        (err, result) => {

            if (err) {

                console.error(
                    "All education years fetch failed:",
                    err.message
                );

                return res.status(500).json({
                    message:
                        "Failed to fetch education years"
                });
            }

            res.status(200).json({
                years: result
            });
        }
    );
};

module.exports = {
    createEducationYear,
    getEducationYears,
    getEducationYearsByDepartment,
    updateEducationYear,
    updateEducationYearStatus
};