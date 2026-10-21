
const express = require("express");
const router = express.Router();

const {
    addSkill,
    getAllSkills,
    updateSkill,
    updateSkillStatus
} = require("../../../controllers/admin/skillswap/swapskillscontroller");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// Only authenticated admins can add skills.
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    addSkill
);

// Get all Skill Swap skills (including inactive)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllSkills
);

// Update a Skill Swap skill
router.put(
    "/:skillId",
    authMiddleware,
    roleMiddleware("admin"),
    updateSkill
);

// Activate or deactivate a Skill Swap skill
router.patch(
    "/:skillId/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateSkillStatus
);

module.exports = router;
