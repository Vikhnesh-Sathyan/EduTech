
const db = require("../../../../config/db");

// ==========================================
// UPDATE PROBLEM STATUS
// ==========================================

const updateProblemStatus = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const problemId = Number(req.params.problemId);
        const { status } = req.body;

        if (!Number.isInteger(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID."
            });
        }

        const allowedStatuses = [
            "draft",
            "published",
            "archived"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem status."
            });
        }

        const [problems] = await db.query(
            `SELECT id, status
             FROM logic_to_code_problems
             WHERE id = ? AND mentor_id = ?`,
            [problemId, mentorId]
        );

        if (problems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Problem not found."
            });
        }

        await db.query(
            `UPDATE logic_to_code_problems
             SET status = ?
             WHERE id = ? AND mentor_id = ?`,
            [status, problemId, mentorId]
        );

        return res.status(200).json({
            success: true,
            message: `Problem ${status} successfully.`,
            status
        });

    } catch (error) {
        console.error("Update Problem Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

module.exports = {
    updateProblemStatus
};
