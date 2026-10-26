
const db = require("../../../../config/db");

// Create a mentor-owned concept comparison.
const createComparison = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const mentorId = req.user.id;

        const {
            title,
            description,
            subjectId,
            concepts,
            rows
        } = req.body;

        if (
            !title?.trim() ||
            !subjectId ||
            !Array.isArray(concepts) ||
            concepts.length < 2 ||
            !Array.isArray(rows) ||
            rows.length === 0
        ) {
            return res.status(400).json({
                message: "Please provide a title, subject, at least two concepts, and comparison rows."
            });
        }

        // Validate concept names and each row's values.
        const conceptNames = concepts.map(concept =>
            typeof concept.name === "string" ? concept.name.trim() : ""
        );

        if (
            conceptNames.some(name => !name) ||
            new Set(conceptNames.map(name => name.toLowerCase())).size !== conceptNames.length ||
            rows.some(row =>
                !row.pointTitle?.trim() ||
                !Array.isArray(row.cells) ||
                row.cells.length !== concepts.length ||
                row.cells.some(cell =>
                    typeof cell.content !== "string" || !cell.content.trim()
                )
            )
        ) {
            return res.status(400).json({
                message: "Each concept needs a unique name, and every comparison row needs a value for each concept."
            });
        }

        // Ensure the subject exists and is active.
        const [subjects] = await connection.execute(
            "SELECT id FROM subjects WHERE id = ? AND status = 'active'",
            [subjectId]
        );

        if (subjects.length === 0) {
            return res.status(400).json({
                message: "The selected subject is invalid or inactive."
            });
        }

        await connection.beginTransaction();

        const [comparisonResult] = await connection.execute(
            `INSERT INTO mentor_concept_comparisons
                (mentor_id, subject_id, title, description, status)
             VALUES (?, ?, ?, ?, 'draft')`,
            [
                mentorId,
                subjectId,
                title.trim(),
                description?.trim() || null
            ]
        );

        const comparisonId = comparisonResult.insertId;
        const conceptIds = [];

        for (let i = 0; i < concepts.length; i++) {
            const [conceptResult] = await connection.execute(
                `INSERT INTO mentor_comparison_concepts
                    (comparison_id, name, display_order)
                 VALUES (?, ?, ?)`,
                [comparisonId, conceptNames[i], i + 1]
            );

            conceptIds.push(conceptResult.insertId);
        }

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];

            const [rowResult] = await connection.execute(
                `INSERT INTO mentor_comparison_rows
                    (comparison_id, point_title, display_order)
                 VALUES (?, ?, ?)`,
                [comparisonId, row.pointTitle.trim(), rowIndex + 1]
            );

            for (let cellIndex = 0; cellIndex < concepts.length; cellIndex++) {
                const cell = row.cells[cellIndex];

                await connection.execute(
                    `INSERT INTO mentor_comparison_cells
                        (row_id, concept_id, content_text, image_url)
                     VALUES (?, ?, ?, ?)`,
                    [
                        rowResult.insertId,
                        conceptIds[cellIndex],
                        cell.content.trim(),
                        null
                    ]
                );
            }
        }

        await connection.commit();

        return res.status(201).json({
            message: "Concept comparison saved as a draft.",
            comparisonId
        });
    } catch (error) {
        await connection.rollback();

        console.error("Create concept comparison error:", error);

        return res.status(500).json({
            message: "Failed to create the concept comparison."
        });
    } finally {
        connection.release();
    }
};

const getMyComparisons = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const sql = `
      SELECT
        cc.id,
        cc.title,
        cc.description,
        cc.subject_id,
        s.name AS subject_name,
        cc.status,
        cc.created_at,
        cc.updated_at
      FROM mentor_concept_comparisons cc
      LEFT JOIN subjects s ON s.id = cc.subject_id
      WHERE cc.mentor_id = ?
      ORDER BY cc.created_at DESC
    `;

    const [comparisons] = await db.query(sql, [mentorId]);

    return res.status(200).json({
      comparisons
    });
  } catch (error) {
    console.error('Get mentor comparisons failed:', error);

    return res.status(500).json({
      message: 'Failed to fetch your comparisons.'
    });
  }
};

module.exports = {
  createComparison,
  getMyComparisons,
  
};
