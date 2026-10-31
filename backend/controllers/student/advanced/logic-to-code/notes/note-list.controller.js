
// =====================================================
// IMPORT DATABASE
// =====================================================

const db = require("../../../../../config/db");


// =====================================================
// GET ALL STUDENT NOTES
// =====================================================

const getStudentNotes = async (req, res) => {

    try {

        const studentId = req.user.id;


        // -------------------------------------------------
        // FETCH STUDENT NOTES
        // -------------------------------------------------

        const [notes] = await db.query(
            `
            SELECT
                n.id,
                n.problem_id,
                n.title,
                n.note_content,
                n.note_type,
                n.language,
                n.is_pinned,
                n.created_at,
                n.updated_at,
                p.title AS problem_title

            FROM logic_to_code_notes n

            LEFT JOIN logic_to_code_problems p
                ON n.problem_id = p.id

            WHERE n.student_id = ?

            ORDER BY
                n.is_pinned DESC,
                n.updated_at DESC
            `,
            [studentId]
        );


        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message: "Student notes fetched successfully",

            totalNotes: notes.length,

            data: notes

        });

    } catch (error) {

        console.error(
            "Get Student Notes Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notes"
        });

    }

};


// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {
    getStudentNotes
};
