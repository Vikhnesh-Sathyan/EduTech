
const db = require("../../config/db");

// ======================================================
// GET ADVANCED MODULE PROGRESS FOR A STUDENT
// ======================================================

const getAdvancedModuleProgress = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const studentId = req.user.id;

    if (
      !subtopicId ||
      !Number.isInteger(Number(subtopicId)) ||
      Number(subtopicId) <= 0
    ) {
      return res.status(400).json({
        message: "Valid subtopic ID is required."
      });
    }

    // Verify the student passed the Basic Challenge.
    const [passedAttempts] = await db.query(
      `
      SELECT id
      FROM basic_challenge_attempts
      WHERE student_id = ?
        AND subtopic_id = ?
        AND passed = TRUE
      LIMIT 1
      `,
      [studentId, Number(subtopicId)]
    );

    if (passedAttempts.length === 0) {
      return res.status(403).json({
        message: "Pass the Basic Challenge to access Advanced progress.",
        advancedUnlocked: false
      });
    }

    // Get the active Advanced setup and its modules.
    const [modules] = await db.query(
      `
      SELECT
        m.id AS module_id,
        m.module_type,
        m.display_order,
        p.completed_at,
        CASE
          WHEN p.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS completed
      FROM learning_subtopic_advanced AS a
      INNER JOIN learning_subtopic_advanced_modules AS m
        ON m.advanced_id = a.id
      LEFT JOIN student_advanced_module_progress AS p
        ON p.advanced_module_id = m.id
        AND p.student_id = ?
      WHERE a.subtopic_id = ?
        AND a.status = 'active'
      ORDER BY m.display_order ASC, m.id ASC
      `,
      [studentId, Number(subtopicId)]
    );

    const completedModules = modules.filter(
      module => Boolean(module.completed)
    ).length;

    return res.status(200).json({
      subtopicId: Number(subtopicId),
      advancedUnlocked: true,
      totalModules: modules.length,
      completedModules,
      progressPercentage: modules.length
        ? Math.round((completedModules / modules.length) * 100)
        : 0,
      modules
    });

  } catch (error) {
    console.error("Get Advanced Module Progress Error:", error);

    return res.status(500).json({
      message: "Failed to load Advanced module progress."
    });
  }
};


// ======================================================
// MARK AN ADVANCED MODULE AS COMPLETED
// ======================================================

const completeAdvancedModule = async (req, res) => {
  try {
    const { subtopicId, moduleId } = req.params;
    const studentId = req.user.id;

    if (
      !subtopicId ||
      !Number.isInteger(Number(subtopicId)) ||
      Number(subtopicId) <= 0 ||
      !moduleId ||
      !Number.isInteger(Number(moduleId)) ||
      Number(moduleId) <= 0
    ) {
      return res.status(400).json({
        message: "Valid subtopic and module IDs are required."
      });
    }

    // Confirm the student passed the Basic Challenge.
    const [passedAttempts] = await db.query(
      `
      SELECT id
      FROM basic_challenge_attempts
      WHERE student_id = ?
        AND subtopic_id = ?
        AND passed = TRUE
      LIMIT 1
      `,
      [studentId, Number(subtopicId)]
    );

    if (passedAttempts.length === 0) {
      return res.status(403).json({
        message: "Pass the Basic Challenge before completing Advanced modules.",
        advancedUnlocked: false
      });
    }

    // Ensure the module belongs to this active Advanced setup.
    const [validModules] = await db.query(
      `
      SELECT m.id
      FROM learning_subtopic_advanced_modules AS m
      INNER JOIN learning_subtopic_advanced AS a
        ON a.id = m.advanced_id
      WHERE m.id = ?
        AND a.subtopic_id = ?
        AND a.status = 'active'
      LIMIT 1
      `,
      [Number(moduleId), Number(subtopicId)]
    );

    if (validModules.length === 0) {
      return res.status(404).json({
        message: "Advanced module not found for this subtopic."
      });
    }

    // The unique student/module key prevents duplicates.
    await db.query(
      `
      INSERT INTO student_advanced_module_progress
        (student_id, advanced_module_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        id = LAST_INSERT_ID(id)
      `,
      [studentId, Number(moduleId)]
    );

    return res.status(200).json({
      message: "Advanced module marked as completed.",
      moduleId: Number(moduleId),
      completed: true
    });

  } catch (error) {
    console.error("Complete Advanced Module Error:", error);

    return res.status(500).json({
      message: "Failed to complete Advanced module."
    });
  }
};

module.exports = {
  getAdvancedModuleProgress,
  completeAdvancedModule
};
