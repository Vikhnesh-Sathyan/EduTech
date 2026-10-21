
const express = require("express");
const router = express.Router();

const {
    saveStudentSkills,
    getMySkills,
    removeMySkill
} = require("../../../controllers/student/skillswap/swapskillstudentcontroller");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// Save the logged-in student's teach/learn skills.
router.post(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    saveStudentSkills
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    getMySkills
);

router.delete(
    "/:skillId",
    authMiddleware,
    roleMiddleware("student"),
    removeMySkill
);

module.exports = router;
