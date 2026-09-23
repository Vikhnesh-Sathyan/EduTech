// Defines authentication API routes
const express = require("express");

const {
    register,
    login,
    getMe
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

// Get the currently logged-in user's information
router.get("/me", authMiddleware, getMe);

module.exports = router;