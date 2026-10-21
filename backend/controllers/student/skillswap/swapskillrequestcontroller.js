
const db = require("../../../config/db");

// ==========================================
// SEND A SKILL SWAP REQUEST
// ==========================================

const sendSwapRequest = async (req, res) => {
    try {
        const senderId = req.user.id;

        const {
            receiver_id,
            request_type,
            teach_skill_id,
            learn_skill_id,
            message
        } = req.body;

        // Validate required fields
        if (
            !Number.isInteger(Number(receiver_id)) ||
            Number(receiver_id) <= 0 ||
            !["learning", "mutual_exchange"].includes(request_type) ||
            !Number.isInteger(Number(learn_skill_id)) ||
            Number(learn_skill_id) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid request details"
            });
        }

        
        // Validate optional message
        if (
            message !== undefined &&
            message !== null &&
            typeof message !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Request message must be text"
            });
        }

        if (typeof message === "string" && message.trim().length > 500) {
            return res.status(400).json({
                success: false,
                message: "Request message cannot exceed 500 characters"
            });
        }

        if (Number(receiver_id) === Number(senderId)) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a request to yourself"
            });
        }

        if (
            request_type === "mutual_exchange" &&
            (
                !Number.isInteger(Number(teach_skill_id)) ||
                Number(teach_skill_id) <= 0 ||
                Number(teach_skill_id) === Number(learn_skill_id)
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid, different teaching skill is required for mutual exchange"
            });
        }

        if (
    request_type === "learning" &&
    teach_skill_id !== undefined &&
    teach_skill_id !== null &&
    teach_skill_id !== ""
) {
    return res.status(400).json({
        success: false,
        message: "Teaching skill is only allowed for mutual exchange"
    });
}

        // Confirm that the receiver exists and is a student
        const [receivers] = await db.execute(
            "SELECT id FROM users WHERE id = ? AND role = 'student'",
            [Number(receiver_id)]
        );

        if (receivers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        // Confirm that the receiver offers the requested skill
        const [receiverSkills] = await db.execute(
            `SELECT id
             FROM student_skills
             WHERE student_id = ?
               AND skill_id = ?
               AND skill_type = 'teach'`,
            [Number(receiver_id), Number(learn_skill_id)]
        );

        if (receiverSkills.length === 0) {
            return res.status(400).json({
                success: false,
                message: "The receiver does not offer to teach this skill"
            });
        }

        // For mutual exchange, confirm the sender teaches the selected skill
        if (request_type === "mutual_exchange") {
            const [senderSkills] = await db.execute(
                `SELECT id
                 FROM student_skills
                 WHERE student_id = ?
                   AND skill_id = ?
                   AND skill_type = 'teach'`,
                [senderId, Number(teach_skill_id)]
            );

            if (senderSkills.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "You must select a skill that you offer to teach"
                });
            }
        }

        // Prevent duplicate pending requests
        const [existingRequests] = await db.execute(
            `SELECT id
             FROM skill_swap_requests
             WHERE sender_id = ?
               AND receiver_id = ?
               AND request_type = ?
               AND teach_skill_id <=> ?
               AND learn_skill_id = ?
               AND status = 'pending'
             LIMIT 1`,
            [
                senderId,
                Number(receiver_id),
                request_type,
                request_type === "mutual_exchange"
                    ? Number(teach_skill_id)
                    : null,
                Number(learn_skill_id)
            ]
        );

        if (existingRequests.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You already have this pending Skill Swap request"
            });
        }

        // Create the request
        const [result] = await db.execute(
            `INSERT INTO skill_swap_requests
                (
                    sender_id,
                    receiver_id,
                    request_type,
                    teach_skill_id,
                    learn_skill_id,
                    message
                )
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                senderId,
                Number(receiver_id),
                request_type,
                request_type === "mutual_exchange"
                    ? Number(teach_skill_id)
                    : null,
                Number(learn_skill_id),
                typeof message === "string"
                    ? message.trim() || null
                    : null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Skill Swap request sent successfully",
            data: {
                id: result.insertId,
                status: "pending"
            }
        });

    } catch (error) {
        console.error("Send Skill Swap request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send Skill Swap request"
        });
    }
};

 // ==========================================
// GET MY INCOMING AND OUTGOING REQUESTS
// ==========================================
const getMySwapRequests = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [requests] = await db.execute(
            `SELECT
                r.id,
                r.sender_id,
                sender.name AS sender_name,
                r.receiver_id,
                receiver.name AS receiver_name,
                r.request_type,
                r.teach_skill_id,
                teach_skill.name AS teach_skill_name,
                r.learn_skill_id,
                learn_skill.name AS learn_skill_name,
                r.message,
                r.status,
                r.created_at
             FROM skill_swap_requests r
             INNER JOIN users sender
                ON sender.id = r.sender_id
             INNER JOIN users receiver
                ON receiver.id = r.receiver_id
             LEFT JOIN skills teach_skill
                ON teach_skill.id = r.teach_skill_id
             INNER JOIN skills learn_skill
                ON learn_skill.id = r.learn_skill_id
             WHERE r.sender_id = ? OR r.receiver_id = ?
             ORDER BY r.created_at DESC`,
            [studentId, studentId]
        );

        return res.status(200).json({
            success: true,
            message: "Skill Swap requests fetched successfully",
            data: requests
        });
    } catch (error) {
        console.error("Fetch Skill Swap requests error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch Skill Swap requests"
        });
    }
};


 // ==========================================
// ACCEPT OR REJECT AN INCOMING REQUEST
// ==========================================
const respondToSwapRequest = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { requestId } = req.params;
        const { status } = req.body;

        if (!Number.isInteger(Number(requestId)) || Number(requestId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID"
            });
        }

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be accepted or rejected"
            });
        }

        // Only the receiver can respond to a pending request.
        const [result] = await db.execute(
            `UPDATE skill_swap_requests
             SET status = ?
             WHERE id = ?
               AND receiver_id = ?
               AND status = 'pending'`,
            [status, Number(requestId), studentId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Pending request not found, or you cannot respond to it"
            });
        }

        return res.status(200).json({
            success: true,
            message: `Skill Swap request ${status} successfully`,
            data: {
                request_id: Number(requestId),
                status
            }
        });
    } catch (error) {
        console.error("Respond to Skill Swap request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to respond to Skill Swap request"
        });
    }
};

// CANCEL A PENDING REQUEST
const cancelSwapRequest = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { requestId } = req.params;

        if (!Number.isInteger(Number(requestId)) || Number(requestId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID"
            });
        }

        const [result] = await db.execute(
            `UPDATE skill_swap_requests
             SET status = 'cancelled'
             WHERE id = ?
               AND sender_id = ?
               AND status = 'pending'`,
            [Number(requestId), studentId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Pending request not found, or you cannot cancel it"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Skill Swap request cancelled successfully",
            data: {
                request_id: Number(requestId),
                status: "cancelled"
            }
        });
    } catch (error) {
        console.error("Cancel Skill Swap request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to cancel Skill Swap request"
        });
    }
};



module.exports = {
    sendSwapRequest,
    getMySwapRequests,
    respondToSwapRequest,
    cancelSwapRequest
};