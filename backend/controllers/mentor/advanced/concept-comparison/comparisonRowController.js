const db = require("../../../../config/db");

const getOwnedComparison = async (connection, comparisonId, mentorId) => {
    const [rows] = await connection.execute(
        `SELECT id, status
         FROM mentor_concept_comparisons
         WHERE id = ? AND mentor_id = ?
         LIMIT 1`,
        [comparisonId, mentorId]
    );

    return rows[0] || null;
};

// Add a comparison row.
const addComparisonRow = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const mentorId = req.user.id;
        const comparisonId = Number(req.params.id);
        const pointTitle = req.body.pointTitle?.trim();

        if (
            !Number.isInteger(comparisonId) ||
            comparisonId <= 0 ||
            !pointTitle
        ) {
            return res.status(400).json({
                message: "A valid comparison ID and point title are required."
            });
        }

        await connection.beginTransaction();

        const comparison = await getOwnedComparison(
            connection,
            comparisonId,
            mentorId
        );

        if (!comparison) {
            await connection.rollback();

            return res.status(404).json({
                message: "Comparison not found."
            });
        }

        if (comparison.status !== "draft") {
            await connection.rollback();

            return res.status(400).json({
                message: "Only draft comparisons can be edited."
            });
        }

        const [concepts] = await connection.execute(
            `SELECT id
             FROM mentor_comparison_concepts
             WHERE comparison_id = ?
             ORDER BY display_order ASC`,
            [comparisonId]
        );

        const [orderRows] = await connection.execute(
            `SELECT COALESCE(MAX(display_order), 0) AS max_order
             FROM mentor_comparison_rows
             WHERE comparison_id = ?`,
            [comparisonId]
        );

        const [result] = await connection.execute(
            `INSERT INTO mentor_comparison_rows
                (comparison_id, point_title, display_order)
             VALUES (?, ?, ?)`,
            [
                comparisonId,
                pointTitle,
                Number(orderRows[0].max_order) + 1
            ]
        );

        for (const concept of concepts) {
            await connection.execute(
                `INSERT INTO mentor_comparison_cells
                    (row_id, concept_id, content_text, image_url)
                 VALUES (?, ?, '', NULL)`,
                [result.insertId, concept.id]
            );
        }

        await connection.commit();

        return res.status(201).json({
            message: "Comparison row added.",
            rowId: result.insertId
        });
    } catch (error) {
        if (connection) await connection.rollback();

        console.error("Add comparison row error:", error);

        return res.status(500).json({
            message: "Failed to add comparison row."
        });
    } finally {
        if (connection) connection.release();
    }
};

// Update a comparison row and all its concept cells.
const updateComparisonRow = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const mentorId = req.user.id;
        const rowId = Number(req.params.rowId);
        const pointTitle = req.body.pointTitle?.trim();
        const { cells } = req.body;

        if (
            !Number.isInteger(rowId) ||
            rowId <= 0 ||
            !pointTitle ||
            !Array.isArray(cells)
        ) {
            return res.status(400).json({
                message: "A valid row ID, title, and cells are required."
            });
        }

        await connection.beginTransaction();

        const [rows] = await connection.execute(
            `SELECT
                r.id,
                r.comparison_id,
                cc.status
             FROM mentor_comparison_rows r
             INNER JOIN mentor_concept_comparisons cc
                ON cc.id = r.comparison_id
             WHERE r.id = ? AND cc.mentor_id = ?
             LIMIT 1`,
            [rowId, mentorId]
        );

        if (!rows.length) {
            await connection.rollback();

            return res.status(404).json({
                message: "Comparison row not found."
            });
        }

        const row = rows[0];

        if (row.status !== "draft") {
            await connection.rollback();

            return res.status(400).json({
                message: "Only draft comparisons can be edited."
            });
        }

        const [concepts] = await connection.execute(
            `SELECT id
             FROM mentor_comparison_concepts
             WHERE comparison_id = ?
             ORDER BY display_order ASC`,
            [row.comparison_id]
        );

        const normalizedCells = cells.map(cell => ({
            conceptId: Number(cell.conceptId),
            content: typeof cell.content === "string"
                ? cell.content.trim()
                : "",
            imageUrl: typeof cell.imageUrl === "string" &&
                cell.imageUrl.trim()
                ? cell.imageUrl.trim()
                : null
        }));

        const expectedIds = concepts.map(concept => Number(concept.id));
        const submittedIds = normalizedCells.map(cell => cell.conceptId);

        if (
            normalizedCells.length !== concepts.length ||
            new Set(submittedIds).size !== submittedIds.length ||
            expectedIds.some(id => !submittedIds.includes(id)) ||
            normalizedCells.some(cell => !cell.content && !cell.imageUrl)
        ) {
            await connection.rollback();

            return res.status(400).json({
                message: "Provide content or an image for every concept."
            });
        }

        await connection.execute(
            `UPDATE mentor_comparison_rows
             SET point_title = ?
             WHERE id = ?`,
            [pointTitle, rowId]
        );

        for (const cell of normalizedCells) {
            const [result] = await connection.execute(
                `UPDATE mentor_comparison_cells
                 SET content_text = ?, image_url = ?
                 WHERE row_id = ? AND concept_id = ?`,
                [
                    cell.content,
                    cell.imageUrl,
                    rowId,
                    cell.conceptId
                ]
            );

            if (result.affectedRows === 0) {
                const [existingCells] = await connection.execute(
                    `SELECT id
                     FROM mentor_comparison_cells
                     WHERE row_id = ? AND concept_id = ?
                     LIMIT 1`,
                    [rowId, cell.conceptId]
                );

                if (!existingCells.length) {
                    await connection.rollback();

                    return res.status(400).json({
                        message: "A comparison cell is missing. Reload the comparison and try again."
                    });
                }
            }
        }

        await connection.commit();

        return res.status(200).json({
            message: "Comparison row updated."
        });
    } catch (error) {
        if (connection) await connection.rollback();

        console.error("Update comparison row error:", error);

        return res.status(500).json({
            message: "Failed to update comparison row."
        });
    } finally {
        if (connection) connection.release();
    }
};

// Delete a comparison row and its cells.
const deleteComparisonRow = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const mentorId = req.user.id;
        const rowId = Number(req.params.rowId);

        if (!Number.isInteger(rowId) || rowId <= 0) {
            return res.status(400).json({
                message: "Invalid row ID."
            });
        }

        await connection.beginTransaction();

        const [rows] = await connection.execute(
            `SELECT
                r.id,
                cc.status
             FROM mentor_comparison_rows r
             INNER JOIN mentor_concept_comparisons cc
                ON cc.id = r.comparison_id
             WHERE r.id = ? AND cc.mentor_id = ?
             LIMIT 1`,
            [rowId, mentorId]
        );

        if (!rows.length) {
            await connection.rollback();

            return res.status(404).json({
                message: "Comparison row not found."
            });
        }

        if (rows[0].status !== "draft") {
            await connection.rollback();

            return res.status(400).json({
                message: "Only draft comparisons can be edited."
            });
        }

        await connection.execute(
            `DELETE FROM mentor_comparison_cells
             WHERE row_id = ?`,
            [rowId]
        );

        await connection.execute(
            `DELETE FROM mentor_comparison_rows
             WHERE id = ?`,
            [rowId]
        );

        await connection.commit();

        return res.status(200).json({
            message: "Comparison row deleted."
        });
    } catch (error) {
        if (connection) await connection.rollback();

        console.error("Delete comparison row error:", error);

        return res.status(500).json({
            message: "Failed to delete comparison row."
        });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    addComparisonRow,
    updateComparisonRow,
    deleteComparisonRow
};