
const db = require("../../../../config/db");

// Publish a mentor-owned comparison.
const publishComparison = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const mentorId = req.user.id;
        const comparisonId = Number(req.params.id);

        if (!Number.isInteger(comparisonId) || comparisonId <= 0) {
            return res.status(400).json({
                message: "Invalid comparison ID."
            });
        }

        await connection.beginTransaction();

        const [comparisons] = await connection.execute(
            `SELECT id, status
             FROM mentor_concept_comparisons
             WHERE id = ? AND mentor_id = ?
             LIMIT 1`,
            [comparisonId, mentorId]
        );

        if (!comparisons.length) {
            await connection.rollback();

            return res.status(404).json({
                message: "Comparison not found."
            });
        }

        if (comparisons[0].status !== "draft") {
            await connection.rollback();

            return res.status(400).json({
                message: "Only draft comparisons can be published."
            });
        }

        const [concepts] = await connection.execute(
            `SELECT id
             FROM mentor_comparison_concepts
             WHERE comparison_id = ?`,
            [comparisonId]
        );

        const [rows] = await connection.execute(
            `SELECT id
             FROM mentor_comparison_rows
             WHERE comparison_id = ?`,
            [comparisonId]
        );

        if (concepts.length < 2 || rows.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                message: "Add at least two concepts and one comparison row before publishing."
            });
        }

        // Every row must contain content or an image for every concept.
        const [incompleteCells] = await connection.execute(
            `SELECT r.id
             FROM mentor_comparison_rows r
             CROSS JOIN mentor_comparison_concepts c
             LEFT JOIN mentor_comparison_cells cell
               ON cell.row_id = r.id
              AND cell.concept_id = c.id
             WHERE r.comparison_id = ?
               AND c.comparison_id = ?
               AND (
                   cell.id IS NULL
                   OR (
                       COALESCE(TRIM(cell.content_text), '') = ''
                       AND COALESCE(TRIM(cell.image_url), '') = ''
                   )
               )
             LIMIT 1`,
            [comparisonId, comparisonId]
        );

        if (incompleteCells.length) {
            await connection.rollback();

            return res.status(400).json({
                message: "Complete every concept cell before publishing."
            });
        }

        await connection.execute(
            `UPDATE mentor_concept_comparisons
             SET status = 'published'
             WHERE id = ? AND mentor_id = ?`,
            [comparisonId, mentorId]
        );

        await connection.commit();

        return res.status(200).json({
            message: "Concept comparison published successfully."
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Publish comparison error:", error);

        return res.status(500).json({
            message: "Failed to publish comparison."
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Move a published comparison back to draft.
const unpublishComparison = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const comparisonId = Number(req.params.id);

        if (!Number.isInteger(comparisonId) || comparisonId <= 0) {
            return res.status(400).json({
                message: "Invalid comparison ID."
            });
        }

        const [result] = await db.query(
            `UPDATE mentor_concept_comparisons
             SET status = 'draft'
             WHERE id = ?
               AND mentor_id = ?
               AND status = 'published'`,
            [comparisonId, mentorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Published comparison not found."
            });
        }

        return res.status(200).json({
            message: "Comparison moved back to draft."
        });
    } catch (error) {
        console.error("Unpublish comparison error:", error);

        return res.status(500).json({
            message: "Failed to unpublish comparison."
        });
    }
};

module.exports = {
    publishComparison,
    unpublishComparison
};
