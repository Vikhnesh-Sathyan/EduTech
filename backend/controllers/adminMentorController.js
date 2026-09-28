// Handles mentor verification for admin

const db = require("../config/db");

// Get mentors waiting for verification
const getPendingMentors = (req, res) => {

  const sql = `
    SELECT
      mp.id,
      u.id AS user_id,
      u.name,
      u.email,
      mp.professional_title,
      mp.specialization,
      mp.bio,
      mp.experience_years,
      mp.skills,
      mp.linkedin_url,
      mp.github_url,
      mp.availability_days,
      mp.availability_start_time,
      mp.availability_end_time,
      mp.verification_status,
      mp.verification_note
    FROM mentor_profiles mp
    INNER JOIN users u
      ON u.id = mp.user_id
    WHERE mp.verification_status = 'pending'
    ORDER BY mp.created_at DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.error(
        "Pending mentors fetch failed:",
        err.message
      );

      return res.status(500).json({
        message: "Failed to load pending mentors"
      });
    }

      console.log("PENDING MENTORS:", result);

    
    res.status(200).json({
      mentors: result
    });

  });
};

// Approve a mentor profile
const approveMentor = (req, res) => {

  const { mentorId } = req.params;

  const sql = `
    UPDATE mentor_profiles
    SET
      verification_status = 'approved',
      verification_note = NULL
    WHERE id = ?
  `;

  db.query(sql, [mentorId], (err, result) => {

    if (err) {
      console.error(
        "Mentor approval failed:",
        err.message
      );

      return res.status(500).json({
        message: "Failed to approve mentor"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Mentor profile not found"
      });
    }

    res.status(200).json({
      message: "Mentor approved successfully"
    });

  });
};


// Reject a mentor profile
const rejectMentor = (req, res) => {

  const { mentorId } = req.params;
  const { verification_note } = req.body;

  if (!verification_note) {
    return res.status(400).json({
      message: "Rejection reason is required"
    });
  }

  const sql = `
    UPDATE mentor_profiles
    SET
      verification_status = 'rejected',
      verification_note = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [verification_note, mentorId],
    (err, result) => {

      if (err) {
        console.error(
          "Mentor rejection failed:",
          err.message
        );

        return res.status(500).json({
          message: "Failed to reject mentor"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Mentor profile not found"
        });
      }

      res.status(200).json({
        message: "Mentor rejected successfully"
      });

    }
  );
};

module.exports = {
  getPendingMentors,
  approveMentor,
  rejectMentor
};