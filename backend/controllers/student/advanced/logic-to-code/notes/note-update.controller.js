
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
            subject_id,
            problem_id,
            title,
            note_content
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
        // VALIDATE SUBJECT ID
        // -------------------------------------------------

        const updatedSubjectId = subject_id !== undefined
            ? Number(subject_id)
            : existingNote.subject_id;

        if (
            !Number.isInteger(updatedSubjectId) ||
            updatedSubjectId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid subject"
            });
        }


        // -------------------------------------------------
        // CHECK SUBJECT EXISTS
        // -------------------------------------------------

        const [subjects] = await db.query(
            `
            SELECT id
            FROM subjects
            WHERE id = ?
            `,
            [updatedSubjectId]
        );

        if (subjects.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Selected subject not found"
            });

        }


        // -------------------------------------------------
        // VALIDATE PROBLEM ID
        // -------------------------------------------------

        let updatedProblemId = existingNote.problem_id;

        if (problem_id !== undefined) {

            if (
                problem_id === null ||
                problem_id === ""
            ) {
                updatedProblemId = null;
            } else {

                updatedProblemId = Number(problem_id);

                if (
                    !Number.isInteger(updatedProblemId) ||
                    updatedProblemId <= 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid problem ID"
                    });
                }

            }

        }


        // -------------------------------------------------
        // CHECK PROBLEM BELONGS TO SELECTED SUBJECT
        // -------------------------------------------------

        if (updatedProblemId !== null) {

            const [problems] = await db.query(
                `
                SELECT id
                FROM logic_to_code_problems
                WHERE id = ?
                AND subject_id = ?
                AND status = 'published'
                `,
                [
                    updatedProblemId,
                    updatedSubjectId
                ]
            );

            if (problems.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Selected problem does not belong to this subject or is not published"
                });

            }

        }


        // -------------------------------------------------
        // VALIDATE NOTE TITLE
        // -------------------------------------------------

        const updatedTitle = title !== undefined
            ? title
            : existingNote.title;

        if (
            typeof updatedTitle !== "string" ||
            !updatedTitle.trim() ||
            updatedTitle.trim().length > 200
        ) {
            return res.status(400).json({
                success: false,
                message: "Note title is required and cannot exceed 200 characters"
            });
        }


        // -------------------------------------------------
        // VALIDATE NOTE CONTENT
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
        // UPDATE NOTE
        // -------------------------------------------------

        await db.query(
            `
            UPDATE logic_to_code_notes

            SET
                subject_id = ?,
                problem_id = ?,
                title = ?,
                note_content = ?

            WHERE id = ?
            AND student_id = ?
            `,
            [
                updatedSubjectId,
                updatedProblemId,
                updatedTitle.trim(),
                updatedContent.trim(),
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
