// Handles admin management of departments

const db = require("../config/db");


// Create a department under an education program
const createDepartment = (req, res) => {

    const {
        education_program_id,
        name
    } = req.body;

    // Validate required department data
    if (!education_program_id || !name || !name.trim()) {
        return res.status(400).json({
            message: "Education program and department name are required"
        });
    }

    const sql = `
        INSERT INTO departments
        (education_program_id, name)
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [education_program_id, name.trim()],
        (err, result) => {

            if (err) {

                // Handle duplicate department name
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Department already exists for this program"
                    });
                }

                console.error(
                    "Department creation failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to create department"
                });
            }

            res.status(201).json({
                message: "Department created successfully",
                departmentId: result.insertId
            });
        }
    );
};

// Get all departments with their education program names
const getDepartments = (req, res) => {

    const sql = `
        SELECT
            d.id,
            d.education_program_id,
            d.name,
            d.status,
            d.created_at,
            d.updated_at,
            p.name AS program_name
        FROM departments d
        INNER JOIN education_programs p
            ON p.id = d.education_program_id
        ORDER BY p.name ASC, d.name ASC
    `;

    db.query(
        sql,
        (err, result) => {

            if (err) {

                console.error(
                    "All departments fetch failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to fetch departments"
                });
            }

            res.status(200).json({
                departments: result
            });
        }
    );
};

// Get departments for an education program
const getDepartmentsByProgram = (req, res) => {

    const { programId } = req.params;

    const sql = `
        SELECT
            id,
            education_program_id,
            name,
            status,
            created_at,
            updated_at
        FROM departments
        WHERE education_program_id = ?
        ORDER BY name ASC
    `;

    db.query(
        sql,
        [programId],
        (err, result) => {

            if (err) {

                console.error(
                    "Departments fetch failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to fetch departments"
                });
            }

            res.status(200).json({
                departments: result
            });
        }
    );
};


// Update a department
const updateDepartment = (req, res) => {

    const { id } = req.params;
    const { name } = req.body;

    // Validate required department name
    if (!name || !name.trim()) {
        return res.status(400).json({
            message: "Department name is required"
        });
    }

    const sql = `
        UPDATE departments
        SET name = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name.trim(), id],
        (err, result) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Department already exists for this program"
                    });
                }

                console.error(
                    "Department update failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to update department"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Department not found"
                });
            }

            res.status(200).json({
                message: "Department updated successfully"
            });
        }
    );
};


// Activate or deactivate a department
const updateDepartmentStatus = (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    // Validate the requested status
    if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
            message: "Status must be active or inactive"
        });
    }

    const sql = `
        UPDATE departments
        SET status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [status, id],
        (err, result) => {

            if (err) {

                console.error(
                    "Department status update failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to update department status"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Department not found"
                });
            }

            res.status(200).json({
                message: "Department status updated successfully"
            });
        }
    );
};


module.exports = {
    createDepartment,
    getDepartments,
    getDepartmentsByProgram,
    updateDepartment,
    updateDepartmentStatus
};