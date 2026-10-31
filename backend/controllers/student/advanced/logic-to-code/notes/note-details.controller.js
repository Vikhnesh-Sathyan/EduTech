
// =====================================================
// IMPORT DATABASE
// =====================================================

const db = require("../../../../../config/db");


// =====================================================
// GET STUDENT NOTE BY ID
// =====================================================

const getStudentNoteById = async (req, res) => {

    try {

        const studentId = req.user.id;

        const noteId = Number(req.params.noteId);


        // -------------------------------------------------
        // VALIDATE NOTE ID
        // -------------------------------------------------

        if (
            !Number.isInteger(noteId) ||
            noteId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid note ID"
            });
        }


        // -------------------------------------------------
        // FETCH STUDENT NOTE
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

            WHERE n.id = ?
            AND n.student_id = ?
            `,
            [noteId, studentId]
        );


        // -------------------------------------------------
        // CHECK NOTE EXISTS
        // -------------------------------------------------

        if (notes.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Note not found"
            });

        }


        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message: "Note fetched successfully",

            data: notes[0]

        });

    } catch (error) {

        console.error(
            "Get Student Note Details Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch note"
        });

    }

};


// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {
    getStudentNoteById
};
