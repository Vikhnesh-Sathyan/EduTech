// Defines student mentor discovery routes
const express = require("express");

const {
    getAvailableMentors
} = require("../controllers/studentMentorController");

const authMiddleware = require("../middleware/AuthMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// STUDENT → VIEW APPROVED MENTORS

router.get(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    getAvailableMentors
);


module.exports = router;