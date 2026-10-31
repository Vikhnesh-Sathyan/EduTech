
// =====================================================
// IMPORT DATABASE
// =====================================================

const db = require("../../../../../config/db");


// =====================================================
// UPDATE STUDENT NOTE
// =====================================================

const updateStudentNote = async (req, res) => {

    try {

        const studentId = req.user.id;
        const noteId = Number(req.params.noteId);

        const {
            title,
            note_content,
            note_type,
            language
        } = req.body;


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
        // FETCH EXISTING NOTE
        // -------------------------------------------------

        const [notes] = await db.query(
            `
            SELECT *
            FROM logic_to_code_notes
            WHERE id = ?
            AND student_id = ?
            `,
            [noteId, studentId]
        );

        if (notes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        const existingNote = notes[0];


        // -------------------------------------------------
        // VALIDATE UPDATED TITLE
        // -------------------------------------------------

        const updatedTitle = title !== undefined
            ? title
            : existingNote.title;

        if (
            typeof updatedTitle !== "string" ||
            !updatedTitle.trim() ||
            updatedTitle.trim().length > 255
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid note title"
            });
        }


        // -------------------------------------------------
        // VALIDATE UPDATED CONTENT
        // -------------------------------------------------

        const updatedContent = note_content !== undefined
            ? note_content
            : existingNote.note_content;

        if (
            typeof updatedContent !== "string" ||
            !updatedContent.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Note content cannot be empty"
            });
        }


        // -------------------------------------------------
        // VALIDATE NOTE TYPE
        // -------------------------------------------------

        const allowedNoteTypes = [
            "theory",
            "code",
            "concept",
            "mistake",
            "other"
        ];

        const updatedType = note_type !== undefined
            ? note_type
            : existingNote.note_type;

        if (!allowedNoteTypes.includes(updatedType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid note type"
            });
        }


        // -------------------------------------------------
        // VALIDATE PROGRAMMING LANGUAGE
        // -------------------------------------------------

        const allowedLanguages = [
            "python",
            "javascript",
            "java"
        ];

        const updatedLanguage = language !== undefined
            ? language
            : existingNote.language;

        if (
            updatedLanguage !== null &&
            !allowedLanguages.includes(updatedLanguage)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid programming language"
            });
        }


        // -------------------------------------------------
        // UPDATE NOTE
        // -------------------------------------------------

        await db.query(
            `
            UPDATE logic_to_code_notes

            SET
                title = ?,
                note_content = ?,
                note_type = ?,
                language = ?

            WHERE id = ?
            AND student_id = ?
            `,
            [
                updatedTitle.trim(),
                updatedContent.trim(),
                updatedType,
                updatedLanguage,
                noteId,
                studentId
            ]
        );


        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message: "Note updated successfully"

        });

    } catch (error) {

        console.error(
            "Update Student Note Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update note"
        });

    }

};


// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {
    updateStudentNote
};
