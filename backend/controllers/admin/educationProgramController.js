// Handles admin management of education programs

const db = require("../../config/db");


// ==========================================
// CREATE EDUCATION PROGRAM
// ==========================================

const createEducationProgram = async (req, res) => {

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

    try {

        const [result] = await db.query(
            sql,
            [name.trim(), description || null]
        );

        res.status(201).json({
            message: "Education program created successfully",
            programId: result.insertId
        });

    } catch (err) {

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
};


// ==========================================
// GET ALL EDUCATION PROGRAMS
// ==========================================

const getEducationPrograms = async (req, res) => {

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
// UPDATE EDUCATION PROGRAM
// ==========================================

const updateEducationProgram = async (req, res) => {

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

    try {

        const [result] = await db.query(
            sql,
            [name.trim(), description || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Education program not found"
            });
        }

        res.status(200).json({
            message: "Education program updated successfully"
        });

    } catch (err) {

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
};


// ==========================================
// ACTIVATE OR DEACTIVATE EDUCATION PROGRAM
// ==========================================

const updateEducationProgramStatus = async (req, res) => {

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

    try {

        const [result] = await db.query(
            sql,
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Education program not found"
            });
        }

        res.status(200).json({
            message: "Education program status updated successfully"
        });

    } catch (err) {

        console.error(
            "Education program status update failed:",
            err.message
        );

        return res.status(500).json({
            message: "Failed to update education program status"
        });
    }
};


module.exports = {
    createEducationProgram,
    getEducationPrograms,
    updateEducationProgram,
    updateEducationProgramStatus
};
