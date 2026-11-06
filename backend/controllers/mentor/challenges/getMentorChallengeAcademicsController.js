
const db = require("../../../config/db");

// Get academic groups and subjects available to the mentor.I created a separate API to dynamically fetch the academic groups and subjects of students connected to the logged-in mentor.

const getMentorChallengeAcademics = async (req, res) => {

    const mentorId = req.user.id;

    const sql = `
        SELECT DISTINCT
            ep.id AS program_id,
            ep.name AS program_name,

            d.id AS department_id,
            d.name AS department_name,

            ey.id AS education_year_id,
            ey.name AS year_name,
            ey.year_order,

            s.id AS subject_id,
            s.name AS subject_name

        FROM mentor_student_relationships msr

        INNER JOIN users mentor
            ON mentor.id = msr.mentor_id

        INNER JOIN users student
            ON student.id = msr.student_id

        INNER JOIN student_profiles sp
            ON sp.user_id = student.id

        INNER JOIN education_programs ep
            ON ep.id = sp.education_program_id

        INNER JOIN departments d
            ON d.id = sp.department_id

        INNER JOIN education_years ey
            ON ey.id = sp.education_year_id
            AND ey.department_id = d.id

        INNER JOIN subjects s
            ON s.education_year_id = ey.id

        WHERE
            msr.mentor_id = ?
            AND msr.status = 'accepted'
            AND msr.is_active = TRUE

            AND mentor.role = 'mentor'
            AND mentor.status = 'active'

            AND student.role = 'student'
            AND student.status = 'active'

            AND s.status = 'active'

        ORDER BY
            ep.name ASC,
            d.name ASC,
            ey.year_order ASC,
            s.name ASC
    `;

    try {

        const [rows] = await db.query(sql, [mentorId]);

        const academics = [];

        const academicMap = new Map();

        rows.forEach(row => {

            const academicKey = [
                row.program_id,
                row.department_id,
                row.education_year_id
            ].join("-");

            if (!academicMap.has(academicKey)) {

                const academic = {
                    program_id: row.program_id,
                    program_name: row.program_name,

                    department_id: row.department_id,
                    department_name: row.department_name,

                    education_year_id: row.education_year_id,
                    year_name: row.year_name,

                    subjects: []
                };

                academicMap.set(academicKey, academic);
                academics.push(academic);
            }

            academicMap.get(academicKey).subjects.push({
                id: row.subject_id,
                name: row.subject_name
            });

        });

        return res.status(200).json({
            success: true,
            academics
        });

    } catch (error) {

        console.error(
            "Mentor challenge academics fetch failed:",
            error.message
        );

        return res.status(500).json({
            message: "Failed to fetch mentor academic groups"
        });
    }
};

module.exports = {
    getMentorChallengeAcademics
};
