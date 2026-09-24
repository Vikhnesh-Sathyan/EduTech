// Handles student access to active education configuration
//is for the Student profile to get the options that Admin has configured.
//STUDENT
  // ↓
//Read active options only
   
const db = require("../config/db");


// Get active education programs
const getEducationPrograms = (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            description
        FROM education_programs
        WHERE status = 'active'
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


// Get active departments for a program
const getDepartmentsByProgram = (req, res) => {

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


// Get active education years for a department
const getEducationYearsByDepartment = (req, res) => {

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


module.exports = {
    getEducationPrograms,
    getDepartmentsByProgram,
    getEducationYearsByDepartment
};