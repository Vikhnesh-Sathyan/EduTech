const db = require("../config/db");


// ==========================================
// GET SUBJECTS FOR LOGGED-IN STUDENT
// ==========================================

const getStudentSubjects = async (req, res) => {

    // Student ID comes from the JWT
    const userId = req.user.id;

    try {

        // Find the student's education year
        const sql = `
            SELECT
                sp.education_year_id
            FROM student_profiles sp
            WHERE sp.user_id = ?
        `;

        const [result] = await db.query(
            sql,
            [userId]
        );


        // Student profile does not exist
        if (result.length === 0) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }


        const educationYearId =
            result[0].education_year_id;


        // Student has not selected an education year
        if (!educationYearId) {
            return res.status(400).json({
                message: "Education year is not configured"
            });
        }


        // Get active subjects for that education year
        const subjectSql = `
            SELECT
                id,
                name,
                description
            FROM subjects
            WHERE education_year_id = ?
              AND status = 'active'
            ORDER BY name ASC
        `;

        const [subjects] = await db.query(
            subjectSql,
            [educationYearId]
        );


        res.status(200).json({
            subjects
        });

    } catch (error) {

        console.error(
            "Student subjects lookup failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load subjects"
        });
    }
};


// ==========================================
// GET ONE SUBJECT FOR LOGGED-IN STUDENT
// ==========================================

const getSubjectById = async (req, res) => {

    // Student ID comes from the JWT
    const userId = req.user.id;

    // Subject ID comes from the URL
    const subjectId = req.params.subjectId;

    try {

        // Find the subject only if it belongs
        // to the student's education year
        const sql = `
            SELECT
                s.id,
                s.name,
                s.description
            FROM subjects s
            INNER JOIN student_profiles sp
                ON sp.education_year_id = s.education_year_id
            WHERE sp.user_id = ?
              AND s.id = ?
              AND s.status = 'active'
        `;

        const [result] = await db.query(
            sql,
            [userId, subjectId]
        );


        // Subject does not exist
        // or does not belong to this student's education year
        if (result.length === 0) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }


        res.status(200).json({
            subject: result[0]
        });

    } catch (error) {

        console.error(
            "Subject lookup failed:",
            error
        );

        return res.status(500).json({
            message: "Failed to load subject"
        });
    }
};


module.exports = {
    getStudentSubjects,
    getSubjectById
};