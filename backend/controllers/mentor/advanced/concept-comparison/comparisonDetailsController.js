const db = require("../../../../config/db");

const getComparisonById = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const comparisonId = Number(req.params.id);

        if (!Number.isInteger(comparisonId) || comparisonId <= 0) {
            return res.status(400).json({
                message: "Invalid comparison ID."
            });
        }

        // Ensure this comparison belongs to the logged-in mentor.
        const [comparisonRows] = await db.query(
            `SELECT
                cc.id,
                cc.mentor_id,
                cc.subject_id,
                cc.title,
                cc.description,
                cc.status,
                cc.created_at,
                cc.updated_at,
                s.name AS subject_name
             FROM mentor_concept_comparisons cc
             LEFT JOIN subjects s ON s.id = cc.subject_id
             WHERE cc.id = ? AND cc.mentor_id = ?
             LIMIT 1`,
            [comparisonId, mentorId]
        );

        if (comparisonRows.length === 0) {
            return res.status(404).json({
                message: "Comparison not found."
            });
        }

        const comparison = comparisonRows[0];

        // Fetch concepts.
        const [concepts] = await db.query(
            `SELECT id, name, display_order
             FROM mentor_comparison_concepts
             WHERE comparison_id = ?
             ORDER BY display_order ASC`,
            [comparisonId]
        );

        // Fetch comparison rows.
        const [rows] = await db.query(
            `SELECT id, comparison_id, point_title, display_order
             FROM mentor_comparison_rows
             WHERE comparison_id = ?
             ORDER BY display_order ASC`,
            [comparisonId]
        );

        // Fetch all cell contents.
        const [cells] = await db.query(
            `SELECT
                c.id,
                c.row_id,
                c.concept_id,
                c.content_text,
                c.image_url
             FROM mentor_comparison_cells c
             INNER JOIN mentor_comparison_rows r
                ON r.id = c.row_id
             WHERE r.comparison_id = ?
             ORDER BY r.display_order ASC, c.concept_id ASC`,
            [comparisonId]
        );

        // Attach each concept's content to its corresponding row.
        const comparisonRowsWithCells = rows.map(row => ({
            ...row,
            cells: concepts.map(concept => {
                const cell = cells.find(
                    item =>
                        item.row_id === row.id &&
                        item.concept_id === concept.id
                );

                return {
                    concept_id: concept.id,
                    content_text: cell?.content_text ?? "",
                    image_url: cell?.image_url ?? null
                };
            })
        }));

        return res.status(200).json({
            comparison: {
                ...comparison,
                concepts,
                rows: comparisonRowsWithCells
            }
        });
    } catch (error) {
        console.error("Get comparison details failed:", error);

        return res.status(500).json({
            message: "Failed to fetch comparison details."
        });
    }
};

module.exports = {
    getComparisonById
};