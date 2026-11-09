const adminTopicService = require("../../services/admin/admin-topic.service");

// Create speaking topic
const createTopic = async (req, res) => {

    try {

        const {
            subject_id,
            title,
            prompt,
            category,
            difficulty = "easy"
        } = req.body || {};

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Topic title is required"
            });
        }

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: "Speaking prompt is required"
            });
        }

        if (
            subject_id !== undefined &&
            subject_id !== null &&
            (!Number.isInteger(Number(subject_id)) || Number(subject_id) <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid subject ID"
            });
        }

        if (!["easy", "medium", "hard"].includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: "Invalid difficulty level"
            });
        }

        const topic = await adminTopicService.createTopic({
            subject_id,
            title: title.trim(),
            prompt: prompt.trim(),
            category: category?.trim() || null,
            difficulty
        });

        return res.status(201).json({
            success: true,
            message: "Speaking topic created successfully",
            topic
        });

    } catch (error) {

        console.error("Create Speaking Topic Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to create speaking topic"
        });
    }
};


// Get all speaking topics
const getAllTopics = async (req, res) => {

    try {

        const topics = await adminTopicService.getAllTopics();

        return res.status(200).json({
            success: true,
            topics
        });

    } catch (error) {

        console.error("Get Speaking Topics Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch speaking topics"
        });
    }
};


// Get topic by ID
const getTopicById = async (req, res) => {

    try {

        const topicId = Number(req.params.topicId);

        if (!Number.isInteger(topicId) || topicId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid topic ID"
            });
        }

        const topic = await adminTopicService.getTopicById(topicId);

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: "Speaking topic not found"
            });
        }

        return res.status(200).json({
            success: true,
            topic
        });

    } catch (error) {

        console.error("Get Speaking Topic Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch speaking topic"
        });
    }
};


// Update speaking topic
const updateTopic = async (req, res) => {

    try {

        const topicId = Number(req.params.topicId);

        const {
            subject_id,
            title,
            prompt,
            category,
            difficulty
        } = req.body || {};

        if (!Number.isInteger(topicId) || topicId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid topic ID"
            });
        }

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Topic title is required"
            });
        }

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: "Speaking prompt is required"
            });
        }

        if (
            subject_id !== undefined &&
            subject_id !== null &&
            (!Number.isInteger(Number(subject_id)) || Number(subject_id) <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid subject ID"
            });
        }

        if (!["easy", "medium", "hard"].includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: "Invalid difficulty level"
            });
        }

        const updated = await adminTopicService.updateTopic(
            topicId,
            {
                subject_id,
                title: title.trim(),
                prompt: prompt.trim(),
                category: category?.trim() || null,
                difficulty
            }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Speaking topic not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Speaking topic updated successfully"
        });

    } catch (error) {

        console.error("Update Speaking Topic Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update speaking topic"
        });
    }
};


// Activate or deactivate topic
const updateTopicStatus = async (req, res) => {

    try {

        const topicId = Number(req.params.topicId);
        const { status } = req.body || {};

        if (!Number.isInteger(topicId) || topicId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid topic ID"
            });
        }

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive"
            });
        }

        const updated = await adminTopicService.updateTopicStatus(
            topicId,
            status
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Speaking topic not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: `Speaking topic ${status} successfully`
        });

    } catch (error) {

        console.error("Update Topic Status Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update topic status"
        });
    }
};


// Delete speaking topic
const deleteTopic = async (req, res) => {

    try {

        const topicId = Number(req.params.topicId);

        if (!Number.isInteger(topicId) || topicId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid topic ID"
            });
        }

        const deleted = await adminTopicService.deleteTopic(topicId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Speaking topic not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Speaking topic deleted successfully"
        });

    } catch (error) {

        console.error("Delete Speaking Topic Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to delete speaking topic"
        });
    }
};


module.exports = {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    updateTopicStatus,
    deleteTopic
};
