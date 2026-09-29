// Handles admin management of education years

const db = require("../config/db");


// ==========================================
// CREATE EDUCATION YEAR
// ==========================================

const createEducationYear = async (req, res) => {

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

    try {

        const [result] = await db.query(
            sql,
            [
                department_id,
                name.trim(),
                year_order
            ]
        );

        res.status(201).json({
            message: "Education year created successfully",
            yearId: result.insertId
        });

    } catch (err) {

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
};


// ==========================================
// GET EDUCATION YEARS BY DEPARTMENT
// ==========================================

const getEducationYearsByDepartment = async (req, res) => {

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

    try {

        const [result] = await db.query(
            sql,
            [departmentId]
        );

        res.status(200).json({
            years: result
        });

    } catch (err) {

        console.error(
            "Education years fetch failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to fetch education years"
        });
    }
};


// ==========================================
// UPDATE EDUCATION YEAR
// ==========================================

const updateEducationYear = async (req, res) => {

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

    try {

        const [result] = await db.query(
            sql,
            [
                name.trim(),
                year_order,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Education year not found"
            });
        }

        res.status(200).json({
            message: "Education year updated successfully"
        });

    } catch (err) {

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
};


// ==========================================
// ACTIVATE OR DEACTIVATE EDUCATION YEAR
// ==========================================

const updateEducationYearStatus = async (req, res) => {

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

    try {

        const [result] = await db.query(
            sql,
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Education year not found"
            });
        }

        res.status(200).json({
            message: "Education year status updated successfully"
        });

    } catch (err) {

        console.error(
            "Education year status update failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to update education year status"
        });
    }
};


// ==========================================
// GET ALL EDUCATION YEARS
// ==========================================

const getEducationYears = async (req, res) => {

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

    try {

        const [result] = await db.query(sql);

        res.status(200).json({
            years: result
        });

    } catch (err) {

        console.error(
            "All education years fetch failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to fetch education years"
        });
    }
};


module.exports = {
    createEducationYear,
    getEducationYears,
    getEducationYearsByDepartment,
    updateEducationYear,
    updateEducationYearStatus
};