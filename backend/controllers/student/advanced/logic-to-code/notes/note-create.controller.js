
// =====================================================
// IMPORT DATABASE
// =====================================================

const db = require("../../../../../config/db");


// =====================================================
// CREATE STUDENT NOTE
// =====================================================

const createStudentNote = async (req, res) => {

    try {

        const studentId = req.user.id;

        const {
            problem_id,
            title,
            note_content,
            note_type = "other",
            language = null
        } = req.body;


        // -------------------------------------------------
        // VALIDATE TITLE AND CONTENT
        // -------------------------------------------------

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof note_content !== "string" ||
            !note_content.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title and note content are required"
            });
        }

        if (title.trim().length > 255) {
            return res.status(400).json({
                success: false,
                message: "Title cannot exceed 255 characters"
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

        if (!allowedNoteTypes.includes(note_type)) {
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

        if (
            language !== null &&
            !allowedLanguages.includes(language)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid programming language"
            });
        }


        // -------------------------------------------------
        // VALIDATE OPTIONAL PROBLEM ID
        // -------------------------------------------------

        let parsedProblemId = null;

        if (problem_id !== undefined && problem_id !== null) {

            parsedProblemId = Number(problem_id);

            if (
                !Number.isInteger(parsedProblemId) ||
                parsedProblemId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid problem ID"
                });
            }

            const [problems] = await db.query(
                `
                SELECT id
                FROM logic_to_code_problems
                WHERE id = ?
                AND status = 'published'
                `,
                [parsedProblemId]
            );

            if (problems.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Published problem not found"
                });
            }

        }


        // -------------------------------------------------
        // INSERT STUDENT NOTE
        // -------------------------------------------------

        const [result] = await db.query(
            `
            INSERT INTO logic_to_code_notes
            (
                student_id,
                problem_id,
                title,
                note_content,
                note_type,
                language
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                studentId,
                parsedProblemId,
                title.trim(),
                note_content.trim(),
                note_type,
                language
            ]
        );


        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        return res.status(201).json({

            success: true,

            message: "Note created successfully",

            noteId: result.insertId

        });

    } catch (error) {

        console.error(
            "Create Student Note Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create note"
        });

    }

};


// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {
    createStudentNote
};
