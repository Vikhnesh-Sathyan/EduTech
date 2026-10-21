
const express = require("express");
const router = express.Router();


const {
    suggestSkill,
    getMySkillSuggestions
} = require("../../../controllers/student/skillswap/swapskillsuggestioncontroller");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// Submit a new skill suggestion
router.post(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    suggestSkill
);


 // Get suggestions submitted by the logged-in student
router.get(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    getMySkillSuggestions
);


module.exports = router;
