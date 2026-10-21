
const express = require("express");
const router = express.Router();


const {
    getSkillSuggestions,
    reviewSkillSuggestion,
    getSkillSuggestionStats
} = require("../../../controllers/admin/skillswap/swapskillsuggestioncontroller");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// View all skill suggestions or filter by status
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getSkillSuggestions
);


 // Approve or reject a student skill suggestion
router.patch(
    "/:suggestionId/review",
    authMiddleware,
    roleMiddleware("admin"),
    reviewSkillSuggestion
);

router.get(
    "/stats",
    authMiddleware,
    roleMiddleware("admin"),
    getSkillSuggestionStats
);

module.exports = router;
