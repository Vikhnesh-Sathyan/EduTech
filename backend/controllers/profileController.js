// Handles retrieving the authenticated student's profile
const db = require("../config/db");

const getProfile = (req, res) => {

const sql = `
    SELECT
        sp.id,
        u.name,
        u.email,
        sp.education_program_id,
        sp.department_id,
        sp.education_year_id,
        sp.career_goal,
        sp.learning_goals
    FROM student_profiles sp
    INNER JOIN users u
        ON u.id = sp.user_id
    WHERE sp.user_id = ?
`;

    db.query(sql, [req.user.id], (err, result) => {

        if (err) {
            console.error("Profile fetch failed:", err.message);

            return res.status(500).json({
                message: "Database error"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            profile: result[0]
        });
    });
};

// Creates or updates the authenticated student's profile
const saveProfile = (req, res) => {

    const {
    education_program_id,
    department_id,
    education_year_id,
    career_goal,
    learning_goals
} = req.body;

const sql = `
    INSERT INTO student_profiles
    (
        user_id,
        education_program_id,
        department_id,
        education_year_id,
        career_goal,
        learning_goals
    )
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        education_program_id = VALUES(education_program_id),
        department_id = VALUES(department_id),
        education_year_id = VALUES(education_year_id),
        career_goal = VALUES(career_goal),
        learning_goals = VALUES(learning_goals)
`;

    db.query(
      [
         req.user.id,
        education_program_id,
        department_id,
        education_year_id,
        career_goal,
        learning_goals
      ],
        (err) => {

            if (err) {
                console.error("Profile save failed:", err.message);

                return res.status(500).json({
                    message: "Profile save failed"
                });
            }

            res.status(200).json({
                message: "Profile saved successfully"
            });
        }
    );
};

module.exports = {
    getProfile,
    saveProfile

};