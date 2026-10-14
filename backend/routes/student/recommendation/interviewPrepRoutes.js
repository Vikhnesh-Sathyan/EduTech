const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");

const {
    createInterviewPrep,
    getAllInterviewPrep,
    getMyInterviewPrep,
    getInterviewPrepById,
    updateInterviewPrep,
    deleteInterviewPrep
} = require("../../../controllers/student/recommendations/interviewPrepController");

// Create a preparation post
router.post("/", authMiddleware, createInterviewPrep);

// Get all preparation posts
router.get("/", authMiddleware, getAllInterviewPrep);

// Get the current student's posts
router.get("/my", authMiddleware, getMyInterviewPrep);

// Get one preparation post
router.get("/:id", authMiddleware, getInterviewPrepById);

// Update a preparation post
router.put("/:id", authMiddleware, updateInterviewPrep);

// Delete a preparation post
router.delete("/:id", authMiddleware, deleteInterviewPrep);

module.exports = router;