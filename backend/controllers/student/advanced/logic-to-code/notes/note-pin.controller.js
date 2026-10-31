
// =====================================================
// IMPORT DATABASE
// =====================================================

const db = require("../../../../../config/db");


// =====================================================
// TOGGLE STUDENT NOTE PIN
// =====================================================

const toggleStudentNotePin = async (req, res) => {

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
        // FIND STUDENT NOTE
        // -------------------------------------------------

        const [notes] = await db.query(
            `
            SELECT
                id,
                is_pinned

            FROM logic_to_code_notes

            WHERE id = ?
            AND student_id = ?
            `,
            [
                noteId,
                studentId
            ]
        );


        if (notes.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Note not found"
            });

        }


        // -------------------------------------------------
        // TOGGLE PIN STATUS
        // -------------------------------------------------

        const newPinStatus = notes[0].is_pinned ? 0 : 1;


        await db.query(
            `
            UPDATE logic_to_code_notes

            SET is_pinned = ?

            WHERE id = ?
            AND student_id = ?
            `,
            [
                newPinStatus,
                noteId,
                studentId
            ]
        );


        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message: newPinStatus
                ? "Note pinned successfully"
                : "Note unpinned successfully",

            is_pinned: newPinStatus

        });

    } catch (error) {

        console.error(
            "Toggle Student Note Pin Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update note pin status"
        });

    }

};


// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {
    toggleStudentNotePin
};
