
const db = require("../../../config/db");

// GET active technologies

const getTechnologies = async (req, res) => {
  try {
    const [technologies] = await db.query(`
      SELECT id, name, sort_name, description, created_by
      FROM developer_technologies
      WHERE status = 'active'
      ORDER BY sort_name ASC, name ASC
    `);

    const updatedTechnologies = technologies.map((technology) => ({
      ...technology,
      is_owner:
        Number(technology.created_by) === Number(req.user.id)
    }));

    return res.status(200).json({
      message: 'Technologies fetched successfully.',
      technologies: updatedTechnologies
    });
  } catch (error) {
    console.error('Get technologies error:', error);

    return res.status(500).json({
      message: 'Failed to load technologies.'
    });
  }
};


// CREATE technology
const createTechnology = async (req, res) => {
    try {
        const name = req.body.name?.trim();

        if (!name) {
            return res.status(400).json({
                message: "Technology name is required"
            });
        }

        const [existing] = await db.query(
            `SELECT id FROM developer_technologies
             WHERE LOWER(name) = LOWER(?)
             LIMIT 1`,
            [name]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "This technology already exists"
            });
        }

        const sortName = name.toLowerCase();

        const [result] = await db.query(
            `INSERT INTO developer_technologies
             (name, sort_name, description, created_by, status)
             VALUES (?, ?, NULL, ?, 'active')`,
            [name, sortName, req.user.id]
        );

        return res.status(201).json({
            message: "Technology created successfully",
            technologyId: result.insertId
        });
    } catch (error) {
        console.error("Create mentor technology error:", error);

        return res.status(500).json({
            message: "Failed to create technology"
        });
    }
};

// UPDATE own technology
const updateTechnology = async (req, res) => {
    try {
        const technologyId = req.params.id;
        const name = req.body.name?.trim();

        if (!name) {
            return res.status(400).json({
                message: "Technology name is required"
            });
        }

        const [owned] = await db.query(
            `SELECT id FROM developer_technologies
             WHERE id = ? AND created_by = ?`,
            [technologyId, req.user.id]
        );

        if (owned.length === 0) {
            return res.status(403).json({
                message: "You can only edit technologies you created"
            });
        }

        const [existing] = await db.query(
            `SELECT id FROM developer_technologies
             WHERE LOWER(name) = LOWER(?) AND id != ?
             LIMIT 1`,
            [name, technologyId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "This technology name already exists"
            });
        }

        await db.query(
            `UPDATE developer_technologies
             SET name = ?, sort_name = ?
             WHERE id = ? AND created_by = ?`,
            [name, name.toLowerCase(), technologyId, req.user.id]
        );

        return res.status(200).json({
            message: "Technology updated successfully"
        });
    } catch (error) {
        console.error("Update mentor technology error:", error);

        return res.status(500).json({
            message: "Failed to update technology"
        });
    }
};

// DELETE own technology
const deleteTechnology = async (req, res) => {
    try {
        const technologyId = req.params.id;

        const [owned] = await db.query(
            `SELECT id FROM developer_technologies
             WHERE id = ? AND created_by = ?`,
            [technologyId, req.user.id]
        );

        if (owned.length === 0) {
            return res.status(403).json({
                message: "You can only delete technologies you created"
            });
        }

        await db.query(
            `DELETE FROM developer_technologies
             WHERE id = ? AND created_by = ?`,
            [technologyId, req.user.id]
        );

        return res.status(200).json({
            message: "Technology deleted successfully"
        });
    } catch (error) {
        console.error("Delete mentor technology error:", error);

        return res.status(500).json({
            message: "Failed to delete technology. It may contain existing categories or topics."
        });
    }
};

module.exports = {
    getTechnologies,
    createTechnology,
    updateTechnology,
    deleteTechnology
};
