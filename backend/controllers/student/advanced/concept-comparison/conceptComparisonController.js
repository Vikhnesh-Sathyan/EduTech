
const db = require("../../../../config/db");

// GET /api/student/advanced/concept-comparisons
// Return published comparisons that match the student's saved profile.
const getAvailableComparisons = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get the student's saved academic profile.
        const [profiles] = await db.query(
            `SELECT
                user_id,
                education_program_id,
                department_id,
                education_year_id
             FROM student_profiles
             WHERE user_id = ?
             LIMIT 1`,
            [userId]
        );

        if (!profiles.length) {
            return res.status(404).json({
                message: "Student profile not found."
            });
        }

        const profile = profiles[0];

        if (!profile.department_id || !profile.education_year_id) {
            return res.status(400).json({
                message: "Complete your academic profile to view comparisons."
            });
        }

        // 2. Find published comparisons for the student's academic year
        // and department. Academic year is matched from the saved profile;
        // the student does not choose it manually.
      const [comparisons] = await db.query(
    `SELECT
        c.id,
        c.mentor_id,
        c.subject_id,
        c.title,
        c.description,
        c.status,
        c.created_at,
        c.updated_at,
        s.name AS subject_name,
        s.education_year_id
     FROM mentor_concept_comparisons c
     INNER JOIN subjects s
        ON s.id = c.subject_id
       AND s.status = 'active'
     INNER JOIN education_years ey
        ON ey.id = s.education_year_id
       AND ey.status = 'active'
     INNER JOIN departments d
        ON d.id = ey.department_id
       AND d.status = 'active'
     WHERE c.status = 'published'
       AND s.education_year_id = ?
       AND ey.department_id = ?
       AND d.education_program_id = ?
       AND EXISTS (
           SELECT 1
           FROM student_subjects ss
           WHERE ss.student_id = ?
             AND ss.subject_id = c.subject_id
       )
     ORDER BY c.updated_at DESC, c.id DESC`,
    [
        profile.education_year_id,
        profile.department_id,
        profile.education_program_id,
        userId
    ]
);

        // No matching comparisons is a normal empty result.
        if (!comparisons.length) {
            return res.status(200).json([]);
        }

        const comparisonIds = comparisons.map(item => item.id);
        const placeholders = comparisonIds.map(() => "?").join(",");

        // 3. Fetch concepts belonging to these comparisons.
        const [concepts] = await db.query(
            `SELECT
                id,
                comparison_id,
                name,
                display_order
             FROM mentor_comparison_concepts
             WHERE comparison_id IN (${placeholders})
             ORDER BY comparison_id, display_order, id`,
            comparisonIds
        );

        // 4. Fetch comparison rows.
        const [rows] = await db.query(
            `SELECT
                id,
                comparison_id,
                point_title,
                display_order
             FROM mentor_comparison_rows
             WHERE comparison_id IN (${placeholders})
             ORDER BY comparison_id, display_order, id`,
            comparisonIds
        );

        // 5. Fetch cell content for the returned rows.
        let cells = [];

        if (rows.length) {
            const rowIds = rows.map(row => row.id);
            const rowPlaceholders = rowIds.map(() => "?").join(",");

            const [cellResults] = await db.query(
                `SELECT
                    id,
                    row_id,
                    concept_id,
                    content_text,
                    image_url
                 FROM mentor_comparison_cells
                 WHERE row_id IN (${rowPlaceholders})
                 ORDER BY row_id, concept_id, id`,
                rowIds
            );

            cells = cellResults;
        }

        // 6. Build the nested response for Angular.
        const conceptsByComparison = new Map();
        const rowsByComparison = new Map();
        const cellsByRow = new Map();
        const conceptNames = new Map();

        for (const concept of concepts) {
            if (!conceptsByComparison.has(concept.comparison_id)) {
                conceptsByComparison.set(concept.comparison_id, []);
            }

            conceptsByComparison.get(concept.comparison_id).push({
                id: concept.id,
                name: concept.name,
                displayOrder: concept.display_order
            });

            conceptNames.set(concept.id, concept.name);
        }

        for (const cell of cells) {
            if (!cellsByRow.has(cell.row_id)) {
                cellsByRow.set(cell.row_id, []);
            }

            cellsByRow.get(cell.row_id).push({
                id: cell.id,
                conceptId: cell.concept_id,
                conceptName: conceptNames.get(cell.concept_id) || null,
                contentText: cell.content_text,
                imageUrl: cell.image_url
            });
        }

        for (const row of rows) {
            if (!rowsByComparison.has(row.comparison_id)) {
                rowsByComparison.set(row.comparison_id, []);
            }

            rowsByComparison.get(row.comparison_id).push({
                id: row.id,
                pointTitle: row.point_title,
                displayOrder: row.display_order,
                cells: cellsByRow.get(row.id) || []
            });
        }

        const result = comparisons.map(comparison => ({
            id: comparison.id,
            title: comparison.title,
            description: comparison.description,
            status: comparison.status,
            subjectId: comparison.subject_id,
            subjectName: comparison.subject_name,
            educationYearId: comparison.education_year_id,
            createdAt: comparison.created_at,
            updatedAt: comparison.updated_at,
            concepts: conceptsByComparison.get(comparison.id) || [],
            rows: rowsByComparison.get(comparison.id) || []
        }));

        return res.status(200).json(result);
    } catch (error) {
        console.error("Get available comparisons error:", error);

        return res.status(500).json({
            message: "Failed to load available comparisons."
        });
    }
};

module.exports = {
    getAvailableComparisons
};
