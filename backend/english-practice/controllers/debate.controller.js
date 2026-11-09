const debateService = require("../services/debate.service");


const respond = async (req, res) => {

    try {

        const {
            topic,
            studentPosition,
            studentArgument,
            history = []
        } = req.body;


        if (
            !topic ||
            typeof topic !== "string" ||
            !topic.trim()
        ) {
            return res.status(400).json({
                message: "Debate topic is required"
            });
        }


        if (!["for", "against"].includes(studentPosition)) {
            return res.status(400).json({
                message: "Position must be for or against"
            });
        }


        if (
            !studentArgument ||
            typeof studentArgument !== "string" ||
            !studentArgument.trim()
        ) {
            return res.status(400).json({
                message: "Student argument is required"
            });
        }


        if (!Array.isArray(history) || history.length > 30) {
            return res.status(400).json({
                message: "Invalid debate history"
            });
        }


        const validHistory = history.every(
            (item) =>
                item &&
                ["user", "model"].includes(item.role) &&
                typeof item.content === "string" &&
                item.content.trim()
        );


        if (!validHistory) {
            return res.status(400).json({
                message: "Invalid debate history format"
            });
        }


        const result = await debateService.sendDebateArgument(
            topic,
            studentPosition,
            studentArgument,
            history
        );


        return res.status(200).json(result);

    } catch (error) {

        console.error("Debate controller error:", error.message);

        return res.status(503).json({
            message: error.message
        });

    }

};


module.exports = {
    respond
};