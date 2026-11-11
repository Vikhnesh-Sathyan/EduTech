
const db = require("../../../config/db");

// ==========================================
// GET AUTOMATION SETTINGS
// ==========================================

const getAutomationSettings = async (req, res) => {
    try {
        const [settings] = await db.execute(
            `SELECT
                s.id AS subject_id,
                s.name AS subject_name,

                ep.id AS program_id,
                ep.name AS program_name,

                d.id AS department_id,
                d.name AS department_name,

                ey.id AS education_year_id,
                ey.name AS education_year_name,

                COALESCE(a.publish_time, '08:00:00') AS publish_time,

                COALESCE(a.time_zone, 'Asia/Kolkata') AS time_zone,

                COALESCE(a.low_stock_threshold, 9) AS low_stock_threshold,

                COALESCE(a.status, 'not_configured') AS automation_status

            FROM subjects s

            INNER JOIN education_years ey
                ON s.education_year_id = ey.id

            INNER JOIN departments d
                ON ey.department_id = d.id

            INNER JOIN education_programs ep
                ON d.education_program_id = ep.id

            LEFT JOIN daily_quiz_automation_settings a
                ON a.subject_id = s.id

            WHERE s.status = 'active'
              AND ey.status = 'active'
              AND d.status = 'active'
              AND ep.status = 'active'

            ORDER BY
                ep.name,
                d.name,
                ey.year_order,
                s.name`
        );

        return res.status(200).json({
            success: true,
            settings
        });

    } catch (error) {
        console.error("Get automation settings error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch automation settings"
        });
    }
};


// ==========================================
// SAVE / UPDATE AUTOMATION SETTINGS
// ==========================================

const saveAutomationSettings = async (req, res) => {
    try {
        const {
            subject_id,
            publish_time,
            low_stock_threshold
        } = req.body;

        const subjectId = Number(subject_id);
        const threshold = Number(low_stock_threshold);

        // Validate subject ID
        if (!Number.isInteger(subjectId) || subjectId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid subject ID is required"
            });
        }

        // Validate publication time (HH:MM or HH:MM:SS)
        if (
            typeof publish_time !== "string" ||
            !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(publish_time)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid publication time is required"
            });
        }

        // Validate low-stock threshold
        if (
            !Number.isInteger(threshold) ||
            threshold < 3 ||
            threshold > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Threshold must be between 3 and 1000"
            });
        }

        // Check active subject
        const [subjects] = await db.execute(
            `SELECT id
             FROM subjects
             WHERE id = ?
               AND status = 'active'`,
            [subjectId]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Active subject not found"
            });
        }

        // Insert or update settings
        await db.execute(
            `INSERT INTO daily_quiz_automation_settings
                (subject_id, publish_time, time_zone,
                 low_stock_threshold, status, created_by)
             VALUES (?, ?, 'Asia/Kolkata', ?, 'active', ?)
             ON DUPLICATE KEY UPDATE
                publish_time = VALUES(publish_time),
                low_stock_threshold = VALUES(low_stock_threshold)`,
            [
                subjectId,
                publish_time.length === 5
                    ? `${publish_time}:00`
                    : publish_time,
                threshold,
                req.user.id
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Automation settings saved successfully"
        });

    } catch (error) {
        console.error("Save automation settings error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save automation settings"
        });
    }
};
 

// ==========================================
// PAUSE / RESUME AUTOMATION
// ==========================================

const updateAutomationStatus = async (req, res) => {
    try {
        const subjectId = Number(req.params.subjectId);
        const { status } = req.body;

        if (!Number.isInteger(subjectId) || subjectId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid subject ID"
            });
        }

        if (!["active", "paused"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or paused"
            });
        }

        const [result] = await db.execute(
            `UPDATE daily_quiz_automation_settings
             SET status = ?
             WHERE subject_id = ?`,
            [status, subjectId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Automation settings not found. Save settings first."
            });
        }

        return res.status(200).json({
            success: true,
            message: `Automation ${status === "active" ? "resumed" : "paused"} successfully`
        });

    } catch (error) {
        console.error("Update automation status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update automation status"
        });
    }
};


module.exports = {
    getAutomationSettings,
    saveAutomationSettings,
    updateAutomationStatus
};
