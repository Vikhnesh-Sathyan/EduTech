
const db = require("../../../config/db");

// ==========================================
// SCHEDULE A SKILL SWAP SESSION
// ==========================================

const scheduleSwapSession = async (req, res) => {
    try {
        const studentId = req.user.id;

        const {
            request_id,
            scheduled_at,
            duration_minutes,
            meeting_type,
            meeting_link,
            location,
            notes
        } = req.body;

        // Validate request ID
        if (
            !Number.isInteger(Number(request_id)) ||
            Number(request_id) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid request ID is required"
            });
        }

        // Validate date and time
        const scheduledDate = new Date(scheduled_at);

        if (
            !scheduled_at ||
            Number.isNaN(scheduledDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid session date and time are required"
            });
        }

        if (scheduledDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Session must be scheduled for a future date"
            });
        }

        // Validate duration
        if (
            !Number.isInteger(Number(duration_minutes)) ||
            Number(duration_minutes) < 15 ||
            Number(duration_minutes) > 240
        ) {
            return res.status(400).json({
                success: false,
                message: "Duration must be between 15 and 240 minutes"
            });
        }

        // Validate meeting type
        if (!["online", "in_person"].includes(meeting_type)) {
            return res.status(400).json({
                success: false,
                message: "Meeting type must be online or in_person"
            });
        }

        // Validate optional text fields
        if (
            (meeting_link != null &&
                typeof meeting_link !== "string") ||
            (location != null &&
                typeof location !== "string") ||
            (notes != null &&
                typeof notes !== "string")
        ) {
            return res.status(400).json({
                success: false,
                message: "Meeting details must be text"
            });
        }

        // Validate required meeting details
        if (
            meeting_type === "online" &&
            (!meeting_link || !meeting_link.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Meeting link is required for online sessions"
            });
        }

        if (
            meeting_type === "in_person" &&
            (!location || !location.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Location is required for in-person sessions"
            });
        }

        // Prevent conflicting meeting details
        if (
            meeting_type === "online" &&
            location &&
            location.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Location should not be provided for online sessions"
            });
        }

        if (
            meeting_type === "in_person" &&
            meeting_link &&
            meeting_link.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Meeting link should not be provided for in-person sessions"
            });
        }

        // Validate notes length
        if (
            typeof notes === "string" &&
            notes.trim().length > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Notes cannot exceed 1000 characters"
            });
        }

        // Confirm the request was accepted
        // and this student is a participant
        const [requests] = await db.execute(
            `SELECT id
             FROM skill_swap_requests
             WHERE id = ?
               AND status = 'accepted'
               AND (sender_id = ? OR receiver_id = ?)`,
            [
                Number(request_id),
                studentId,
                studentId
            ]
        );

        if (requests.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only participants in an accepted request can schedule a session"
            });
        }

        // Prevent multiple sessions for the same request
        const [existingSessions] = await db.execute(
            `SELECT id
             FROM skill_swap_sessions
             WHERE request_id = ?
             LIMIT 1`,
            [Number(request_id)]
        );

        if (existingSessions.length > 0) {
            return res.status(409).json({
                success: false,
                message: "A session already exists for this request"
            });
        }

        // Save session
        const [result] = await db.execute(
            `INSERT INTO skill_swap_sessions
                (
                    request_id,
                    scheduled_at,
                    duration_minutes,
                    meeting_type,
                    meeting_link,
                    location,
                    notes,
                    status
                )
             VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
            [
                Number(request_id),
                scheduledDate,
                Number(duration_minutes),
                meeting_type,
                typeof meeting_link === "string"
                    ? meeting_link.trim() || null
                    : null,
                typeof location === "string"
                    ? location.trim() || null
                    : null,
                typeof notes === "string"
                    ? notes.trim() || null
                    : null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Skill Swap session scheduled successfully",
            data: {
                session_id: result.insertId,
                request_id: Number(request_id),
                scheduled_at: scheduledDate,
                duration_minutes: Number(duration_minutes),
                meeting_type,
                status: "scheduled"
            }
        });

    } catch (error) {
        console.error(
            "Schedule Skill Swap session error:",
            error
        );

        // Handle concurrent duplicate session attempts
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "A session already exists for this request"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to schedule Skill Swap session"
        });
    }
};



 // ==========================================
 // GET MY SKILL SWAP SESSIONS
 // ==========================================
const getMySwapSessions = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [sessions] = await db.execute(
            `SELECT
                ss.id AS session_id,
                ss.request_id,
                ss.scheduled_at,
                ss.duration_minutes,
                ss.meeting_type,
                ss.meeting_link,
                ss.location,
                ss.notes,
                ss.status,
                ss.created_at,
                sr.sender_id,
                sr.receiver_id,
                sender.name AS sender_name,
                receiver.name AS receiver_name,
                teach_skill.name AS teach_skill_name,
                learn_skill.name AS learn_skill_name
             FROM skill_swap_sessions ss
             INNER JOIN skill_swap_requests sr
                ON sr.id = ss.request_id
             INNER JOIN users sender
                ON sender.id = sr.sender_id
             INNER JOIN users receiver
                ON receiver.id = sr.receiver_id
             LEFT JOIN skills teach_skill
                ON teach_skill.id = sr.teach_skill_id
             INNER JOIN skills learn_skill
                ON learn_skill.id = sr.learn_skill_id
             WHERE sr.sender_id = ? OR sr.receiver_id = ?
             ORDER BY ss.scheduled_at ASC`,
            [studentId, studentId]
        );

        return res.status(200).json({
            success: true,
            message: "Skill Swap sessions fetched successfully",
            data: sessions
        });

    } catch (error) {
        console.error("Get Skill Swap sessions error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch Skill Swap sessions"
        });
    }
};


 // ==========================================
 // CANCEL A SCHEDULED SKILL SWAP SESSION
 // ==========================================
const cancelSwapSession = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { sessionId } = req.params;

        if (!Number.isInteger(Number(sessionId)) || Number(sessionId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID"
            });
        }

        const [result] = await db.execute(
            `UPDATE skill_swap_sessions ss
             INNER JOIN skill_swap_requests sr
                ON sr.id = ss.request_id
             SET ss.status = 'cancelled'
             WHERE ss.id = ?
               AND (sr.sender_id = ? OR sr.receiver_id = ?)
               AND ss.status = 'scheduled'`,
            [Number(sessionId), studentId, studentId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Scheduled session not found, or you cannot cancel it"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Skill Swap session cancelled successfully",
            data: {
                session_id: Number(sessionId),
                status: "cancelled"
            }
        });

    } catch (error) {
        console.error("Cancel Skill Swap session error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to cancel Skill Swap session"
        });
    }
};


 // ==========================================
 // MARK SKILL SWAP SESSION AS COMPLETED
 // ==========================================

const completeSwapSession = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { sessionId } = req.params;

        // Validate session ID
        if (
            !Number.isInteger(Number(sessionId)) ||
            Number(sessionId) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID"
            });
        }

        // Complete only your own session after its full duration
        const [result] = await db.execute(
            `UPDATE skill_swap_sessions ss
             INNER JOIN skill_swap_requests sr
                ON sr.id = ss.request_id
             SET ss.status = 'completed'
             WHERE ss.id = ?
               AND (sr.sender_id = ? OR sr.receiver_id = ?)
               AND ss.status = 'scheduled'
               AND DATE_ADD(
                    ss.scheduled_at,
                    INTERVAL ss.duration_minutes MINUTE
               ) <= NOW()`,
            [
                Number(sessionId),
                studentId,
                studentId
            ]
        );

        if (result.affectedRows === 0) {
            // Determine why the session could not be completed
            const [sessions] = await db.execute(
                `SELECT
                    ss.status,
                    DATE_ADD(
                        ss.scheduled_at,
                        INTERVAL ss.duration_minutes MINUTE
                    ) AS session_end,
                    sr.sender_id,
                    sr.receiver_id
                 FROM skill_swap_sessions ss
                 INNER JOIN skill_swap_requests sr
                    ON sr.id = ss.request_id
                 WHERE ss.id = ?`,
                [Number(sessionId)]
            );

            if (
                sessions.length === 0 ||
                (
                    Number(sessions[0].sender_id) !== Number(studentId) &&
                    Number(sessions[0].receiver_id) !== Number(studentId)
                )
            ) {
                return res.status(404).json({
                    success: false,
                    message: "Session not found or you do not have permission to complete it"
                });
            }

            if (sessions[0].status !== "scheduled") {
                return res.status(409).json({
                    success: false,
                    message: "Only scheduled sessions can be completed"
                });
            }

            return res.status(400).json({
                success: false,
                message: "The session cannot be completed until its scheduled duration has ended"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Skill Swap session marked as completed",
            data: {
                session_id: Number(sessionId),
                status: "completed"
            }
        });

    } catch (error) {
        console.error(
            "Complete Skill Swap session error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to complete Skill Swap session"
        });
    }
};

module.exports = {
    scheduleSwapSession,
    getMySwapSessions,
    cancelSwapSession,
    completeSwapSession
};