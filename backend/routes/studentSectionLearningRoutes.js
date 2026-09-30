const express = require("express");

const {
    getSectionLearningContent
} = require("../controllers/studentSectionLearningController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Get learning content for one section
router.get(
    "/:sectionId",
    authMiddleware,
    roleMiddleware("student"),
    getSectionLearningContent
);


module.exports = router;