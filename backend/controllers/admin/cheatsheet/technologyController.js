
const db = require("../../../config/db");

// ==========================================
// GET ALL TECHNOLOGIES
// ==========================================
const getTechnologies = async (req, res) => {
    try {
        const [technologies] = await db.query(`
            SELECT
                id,
                name,
                sort_name,
                description,
                status,
                created_at,
                updated_at
            FROM developer_technologies
            ORDER BY sort_name ASC
        `);

        return res.status(200).json({
            message: "Technologies fetched successfully",
            technologies
        });

    } catch (error) {
        console.error("Get technologies error:", error);

        return res.status(500).json({
            message: "Failed to fetch technologies"
        });
    }
};

// ==========================================
// CREATE TECHNOLOGY
// ==========================================
const createTechnology = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Technology name is required"
            });
        }

        const technologyName = name.trim();

        // Keep .NET under N in the A-Z index.
        
        const sortName = technologyName
            .replace(/^\./, "")
            .toUpperCase();


        const createdBy = req.user.id;

        const [result] = await db.query(
            `INSERT INTO developer_technologies
                (name, sort_name, description, created_by)
             VALUES (?, ?, ?, ?)`,
            [
                technologyName,
                sortName,
                description?.trim() || null,
                createdBy
            ]
        );

        return res.status(201).json({
            message: "Technology created successfully",
            technology: {
                id: result.insertId,
                name: technologyName,
                sort_name: sortName,
                description: description?.trim() || null
            }
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This technology already exists"
            });
        }

        console.error("Create technology error:", error);

        return res.status(500).json({
            message: "Failed to create technology"
        });
    }
};

// ==========================================
// UPDATE TECHNOLOGY
// ==========================================
const updateTechnology = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid technology ID"
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Technology name is required"
            });
        }

        if (status !== undefined &&
            !["active", "inactive"].includes(status)) {
            return res.status(400).json({
                message: "Status must be active or inactive"
            });
        }

        const technologyName = name.trim();

            
        const sortName = technologyName
            .replace(/^\./, "")
            .toUpperCase();


        const [result] = await db.query(
            `UPDATE developer_technologies
             SET name = ?,
                 sort_name = ?,
                 description = ?,
                 status = COALESCE(?, status)
             WHERE id = ?`,
            [
                technologyName,
                sortName,
                description?.trim() || null,
                status ?? null,
                Number(id)
            ]
        );

        if (result.affectedRows === 0) {
            const [existing] = await db.query(
                "SELECT id FROM developer_technologies WHERE id = ?",
                [Number(id)]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    message: "Technology not found"
                });
            }
        }

        return res.status(200).json({
            message: "Technology updated successfully"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Another technology already uses this name"
            });
        }

        console.error("Update technology error:", error);

        return res.status(500).json({
            message: "Failed to update technology"
        });
    }
};

// ==========================================
// DELETE TECHNOLOGY
// ==========================================
const deleteTechnology = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid technology ID"
            });
        }

        const [result] = await db.query(
            "DELETE FROM developer_technologies WHERE id = ?",
            [Number(id)]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Technology not found"
            });
        }

        return res.status(200).json({
            message: "Technology deleted successfully"
        });

    } catch (error) {
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                message: "Unable to delete this technology because it is in use"
            });
        }

        console.error("Delete technology error:", error);

        return res.status(500).json({
            message: "Failed to delete technology"
        });
    }
};

module.exports = {
    getTechnologies,
    createTechnology,
    updateTechnology,
    deleteTechnology
};
