
// =====================================================
// IMPORT DATABASE
// =====================================================

const db = require("../../../../../config/db");


// =====================================================
// DELETE STUDENT NOTE
// =====================================================

const deleteStudentNote = async (req, res) => {

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
        // DELETE STUDENT NOTE
        // -------------------------------------------------

        const [result] = await db.query(
            `
            DELETE FROM logic_to_code_notes

            WHERE id = ?
            AND student_id = ?
            `,
            [
                noteId,
                studentId
            ]
        );


        // -------------------------------------------------
        // CHECK DELETE RESULT
        // -------------------------------------------------

        if (result.affectedRows === 0) {

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

            message: "Note deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete Student Note Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete note"
        });

    }

};


// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {
    deleteStudentNote
};
