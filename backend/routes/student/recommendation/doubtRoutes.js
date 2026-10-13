
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");

const {
    createDoubt,
    getAllDoubts,
    getMyDoubts,
    getDoubtById,
    updateDoubt,
    deleteDoubt,
    createReply,
    updateReply,
    deleteReply
} = require("../../../controllers/student/recommendations/doubtController");

// ==========================================
// COMMUNITY DOUBTS
// ==========================================

// Create a doubt
router.post("/", authMiddleware, createDoubt);

// Get all doubts
router.get("/", authMiddleware, getAllDoubts);

// Get the logged-in student's doubts
router.get("/my", authMiddleware, getMyDoubts);

// Get a specific doubt and its replies
router.get("/:id", authMiddleware, getDoubtById);

// Update a doubt
router.put("/:id", authMiddleware, updateDoubt);

// Delete a doubt
router.delete("/:id", authMiddleware, deleteDoubt);

// ==========================================
// DOUBT REPLIES
// ==========================================

// Add a reply to a doubt
router.post("/:id/replies", authMiddleware, createReply);

// Update a reply
router.put("/replies/:replyId", authMiddleware, updateReply);

// Delete a reply
router.delete("/replies/:replyId", authMiddleware, deleteReply);

module.exports = router;
