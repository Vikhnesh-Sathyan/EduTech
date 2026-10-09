// Handles student access to active education configuration
// Student reads only active options configured by Admin

const db = require("../../config/db");


// ==========================================
// GET ACTIVE EDUCATION PROGRAMS
// ==========================================

const getEducationPrograms = async (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            description
        FROM education_programs
        WHERE status = 'active'
        ORDER BY name ASC
    `;

    try {

        const [result] = await db.query(sql);

        res.status(200).json({
            programs: result
        });

    } catch (err) {

        console.error(
            "Education programs fetch failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to fetch education programs"
        });
    }
};


// ==========================================
// GET ACTIVE DEPARTMENTS FOR A PROGRAM
// ==========================================

const getDepartmentsByProgram = async (req, res) => {

    const { programId } = req.params;

    const sql = `
        SELECT
            id,
            name
        FROM departments
        WHERE education_program_id = ?
          AND status = 'active'
        ORDER BY name ASC
    `;

    try {

        const [result] = await db.query(
            sql,
            [programId]
        );

        res.status(200).json({
            departments: result
        });

    } catch (err) {

        console.error(
            "Departments fetch failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to fetch departments"
        });
    }
};


// ==========================================
// GET ACTIVE EDUCATION YEARS FOR A DEPARTMENT
// ==========================================

const getEducationYearsByDepartment = async (req, res) => {

    const { departmentId } = req.params;

    const sql = `
        SELECT
            id,
            name,
            year_order
        FROM education_years
        WHERE department_id = ?
          AND status = 'active'
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


module.exports = {
    getEducationPrograms,
    getDepartmentsByProgram,
    getEducationYearsByDepartment
};
