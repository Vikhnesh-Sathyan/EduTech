
const progressService = require("../services/progress.service");


const generateReport = async (req, res) => {

    try {

        // Temporary placeholder.
        // Later, fetch sessions from MySQL using req.user.id.

        const sessions = req.studentSessions;

        if (!Array.isArray(sessions)) {
            return res.status(500).json({
                success: false,
                message: "Student practice sessions are unavailable"
            });
        }

        // Generate progress report
        const result = await progressService.generateProgressReport(
            sessions
        );

        return res.status(200).json(result);

    } catch (error) {

        console.error(
            "English Practice Progress Error:",
            error.message
        );

        return res.status(503).json({
            success: false,
            message: error.message ||
                "Progress report service is unavailable"
        });
    }
};


module.exports = {
    generateReport
};
