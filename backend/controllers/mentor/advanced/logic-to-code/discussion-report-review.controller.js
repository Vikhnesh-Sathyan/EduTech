const db = require("../../../../config/db");

// =====================================================
// REVIEW DISCUSSION REPORT
// =====================================================

const reviewDiscussionReport = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const reportId = Number(req.params.reportId);

        const { status } = req.body;

        // ---------------------------------------------
        // VALIDATE REPORT ID
        // ---------------------------------------------

        if (
            !Number.isInteger(reportId) ||
            reportId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid report ID"
            });
        }

        // ---------------------------------------------
        // VALIDATE STATUS
        // ---------------------------------------------

        const allowedStatuses = [
            "action_taken",
            "dismissed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be action_taken or dismissed"
            });
        }

        // ---------------------------------------------
        // CHECK REPORT OWNERSHIP
        // ---------------------------------------------

        const [reports] = await db.query(
            `SELECT r.id, r.status
             FROM logic_to_code_discussion_reports r
             JOIN logic_to_code_discussions d
                ON d.id = r.discussion_id
             JOIN logic_to_code_problems p
                ON p.id = d.problem_id
             WHERE r.id = ?
               AND p.mentor_id = ?
             LIMIT 1`,
            [reportId, mentorId]
        );

        if (reports.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Discussion report not found"
            });
        }

        // ---------------------------------------------
        // UPDATE REPORT STATUS
        // ---------------------------------------------

        await db.query(
            `UPDATE logic_to_code_discussion_reports
             SET
                status = ?,
                reviewed_by = ?,
                reviewed_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [status, mentorId, reportId]
        );

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(200).json({
            success: true,
            message: status === "action_taken"
                ? "Report marked as action taken"
                : "Report dismissed successfully",
            report: {
                id: reportId,
                status,
                reviewed_by: mentorId
            }
        });

    } catch (error) {
        console.error("Discussion Report Review Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to review discussion report"
        });
    }
};

module.exports = {
    reviewDiscussionReport
};