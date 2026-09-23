// Defines protected student profile routes

const express = require("express");

const {
    getProfile,
    saveProfile
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get the authenticated student's profile
router.get("/", authMiddleware, getProfile);

// Create or update the authenticated student's profile
router.put("/", authMiddleware, saveProfile);

module.exports = router;