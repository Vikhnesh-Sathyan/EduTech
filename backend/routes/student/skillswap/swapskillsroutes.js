
const express = require("express");
const router = express.Router();

const {
    getSkills
} = require("../../../controllers/student/skillswap/swapskillscontroller");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// Only authenticated students can view available skills.
router.get(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    getSkills
);

module.exports = router;
