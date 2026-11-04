
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
            subject_id,
            problem_id,
            title,
            note_content
        } = req.body;


        // -------------------------------------------------
        // VALIDATE SUBJECT ID
        // -------------------------------------------------

        const parsedSubjectId = Number(subject_id);

        if (
            !Number.isInteger(parsedSubjectId) ||
            parsedSubjectId <= 0
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
            [parsedSubjectId]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Selected subject not found"
            });
        }


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

        if (title.trim().length > 200) {
            return res.status(400).json({
                success: false,
                message: "Title cannot exceed 200 characters"
            });
        }


        // -------------------------------------------------
        // VALIDATE OPTIONAL PROBLEM ID
        // -------------------------------------------------

        let parsedProblemId = null;

        if (problem_id !== undefined && problem_id !== null && problem_id !== "") {

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


            // Check problem belongs to selected subject

            const [problems] = await db.query(
                `
                SELECT id
                FROM logic_to_code_problems
                WHERE id = ?
                AND subject_id = ?
                AND status = 'published'
                `,
                [
                    parsedProblemId,
                    parsedSubjectId
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
        // INSERT STUDENT NOTE
        // -------------------------------------------------

        const [result] = await db.query(
            `
            INSERT INTO logic_to_code_notes
            (
                student_id,
                subject_id,
                problem_id,
                title,
                note_content
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                studentId,
                parsedSubjectId,
                parsedProblemId,
                title.trim(),
                note_content.trim()
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
