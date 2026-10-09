// Handles mentor verification for admin

const db = require("../../config/db");

// ==========================================
// GET MENTORS WAITING FOR VERIFICATION
// ==========================================

const getPendingMentors = async (req, res) => {

  try {

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

    const [result] = await db.query(sql);

    console.log("PENDING MENTORS:", result);

    res.status(200).json({
      mentors: result
    });

  } catch (error) {

    console.error(
      "Pending mentors fetch failed:",
      error
    );

    res.status(500).json({
      message: "Failed to load pending mentors"
    });
  }
};


// ==========================================
// APPROVE MENTOR PROFILE
// ==========================================

const approveMentor = async (req, res) => {

  const { mentorId } = req.params;

  try {

    const sql = `
      UPDATE mentor_profiles
      SET
        verification_status = 'approved',
        verification_note = NULL
      WHERE id = ?
    `;

    const [result] = await db.query(
      sql,
      [mentorId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Mentor profile not found"
      });
    }

    res.status(200).json({
      message: "Mentor approved successfully"
    });

  } catch (error) {

    console.error(
      "Mentor approval failed:",
      error
    );

    res.status(500).json({
      message: "Failed to approve mentor"
    });
  }
};


// ==========================================
// REJECT MENTOR PROFILE
// ==========================================

const rejectMentor = async (req, res) => {

  const { mentorId } = req.params;
  const { verification_note } = req.body;

  if (!verification_note) {
    return res.status(400).json({
      message: "Rejection reason is required"
    });
  }

  try {

    const sql = `
      UPDATE mentor_profiles
      SET
        verification_status = 'rejected',
        verification_note = ?
      WHERE id = ?
    `;

    const [result] = await db.query(
      sql,
      [verification_note, mentorId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Mentor profile not found"
      });
    }

    res.status(200).json({
      message: "Mentor rejected successfully"
    });

  } catch (error) {

    console.error(
      "Mentor rejection failed:",
      error
    );

    res.status(500).json({
      message: "Failed to reject mentor"
    });
  }
};


module.exports = {
  getPendingMentors,
  approveMentor,
  rejectMentor
};
