const db = require("../../../../config/db");

// =====================================================
// STUDENT REPORT A DISCUSSION
// =====================================================

const reportDiscussion = async (req, res) => {
    try {
        const studentId = req.user.id;
        const discussionId = Number(req.params.discussionId);

        const { reason, description } = req.body;

        // ---------------------------------------------
        // VALIDATE DISCUSSION ID
        // ---------------------------------------------

        if (
            !Number.isInteger(discussionId) ||
            discussionId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid discussion ID"
            });
        }

        // ---------------------------------------------
        // VALIDATE REPORT REASON
        // ---------------------------------------------

        const allowedReasons = [
            "spam",
            "harassment",
            "inappropriate",
            "misinformation",
            "other"
        ];

        if (!allowedReasons.includes(reason)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report reason"
            });
        }

        // ---------------------------------------------
        // VALIDATE DESCRIPTION
        // ---------------------------------------------

        if (
            description !== undefined &&
            description !== null &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Description must be text"
            });
        }

        if (
            typeof description === "string" &&
            description.trim().length > 2000
        ) {
            return res.status(400).json({
                success: false,
                message: "Description cannot exceed 2000 characters"
            });
        }

        // ---------------------------------------------
        // CHECK DISCUSSION
        // ---------------------------------------------

        const [discussions] = await db.query(
            `SELECT id
             FROM logic_to_code_discussions
             WHERE id = ?
               AND is_deleted = 0
             LIMIT 1`,
            [discussionId]
        );

        if (discussions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Discussion not found"
            });
        }

        // ---------------------------------------------
        // PREVENT SELF REPORTING
        // ---------------------------------------------

        const [owners] = await db.query(
            `SELECT user_id
             FROM logic_to_code_discussions
             WHERE id = ?`,
            [discussionId]
        );

        if (owners[0].user_id === studentId) {
            return res.status(400).json({
                success: false,
                message: "You cannot report your own discussion"
            });
        }

        // ---------------------------------------------
        // CHECK EXISTING REPORT
        // ---------------------------------------------

        const [existingReports] = await db.query(
            `SELECT id
             FROM logic_to_code_discussion_reports
             WHERE discussion_id = ?
               AND reporter_id = ?
             LIMIT 1`,
            [discussionId, studentId]
        );

        if (existingReports.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You have already reported this discussion"
            });
        }

        // ---------------------------------------------
        // CREATE REPORT
        // ---------------------------------------------

        const [result] = await db.query(
            `INSERT INTO logic_to_code_discussion_reports
                (discussion_id, reporter_id, reason, description)
             VALUES (?, ?, ?, ?)`,
            [
                discussionId,
                studentId,
                reason,
                description?.trim() || null
            ]
        );

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(201).json({
            success: true,
            message: "Discussion reported successfully",
            reportId: result.insertId
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "You have already reported this discussion"
            });
        }

        console.error("Discussion Report Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit discussion report"
        });
    }
};

module.exports = {
    reportDiscussion
};