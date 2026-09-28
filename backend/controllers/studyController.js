const db = require("../config/db");


// ==========================================
// GET SUBJECTS FOR LOGGED-IN STUDENT
// ==========================================

const getStudentSubjects = (req, res) => {

    // Student ID comes from the JWT
    const userId = req.user.id;


    // Find the student's education year
    const sql = `
        SELECT
            sp.education_year_id
        FROM student_profiles sp
        WHERE sp.user_id = ?
    `;


    db.query(sql, [userId], (err, result) => {

        if (err) {
            console.error(
                "Student education year lookup failed:",
                err.message
            );

            return res.status(500).json({
                message: "Failed to load student information"
            });
        }


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


        db.query(
            subjectSql,
            [educationYearId],
            (err, subjects) => {

                if (err) {
                    console.error(
                        "Student subjects lookup failed:",
                        err.message
                    );

                    return res.status(500).json({
                        message: "Failed to load subjects"
                    });
                }


                res.status(200).json({
                    subjects
                });

            }
        );

    });

};

// ==========================================
// GET ONE SUBJECT FOR LOGGED-IN STUDENT
// ==========================================

const getSubjectById = (req, res) => {

    // Student ID comes from the JWT
    const userId = req.user.id;

    // Subject ID comes from the URL
    const subjectId = req.params.subjectId;


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


    db.query(
        sql,
        [userId, subjectId],
        (err, result) => {

            if (err) {

                console.error(
                    "Subject lookup failed:",
                    err.message
                );

                return res.status(500).json({
                    message: "Failed to load subject"
                });

            }


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

        }
    );

};


module.exports = {
    getStudentSubjects,
    getSubjectById
};

