// Handles the admin dashboard overview by providing summary counts
// of education programs, departments, education years, and subjects.

const db = require("../config/db");

const getOverview = (req, res) => {

    const sql = `
        SELECT

            (SELECT COUNT(*)
             FROM education_programs) AS programs,

            (SELECT COUNT(*)
             FROM departments) AS departments,

            (SELECT COUNT(*)
             FROM education_years) AS education_years,

            (SELECT COUNT(*)
             FROM subjects) AS subjects
    `;

    db.query(sql, (error, results) => {

        if (error) {
            console.error(
                "Failed to load admin overview:",
                error.message
            );

            return res.status(500).json({
                message: "Failed to load admin overview."
            });
        }

        res.status(200).json({
            overview: results[0]
        });
    });
};

module.exports = {
    getOverview
};