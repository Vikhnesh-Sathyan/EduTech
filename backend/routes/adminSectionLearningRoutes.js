const express = require("express");

const {
    getSectionLearningContent,
    createSectionLearningContent,
    updateSectionLearningContent
} = require("../controllers/adminSectionLearningController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Multer middleware for learning images
const uploadLearningImage =
    require("../middleware/uploadLearningImage");

const router = express.Router();


// =====================================================
// GET LEARNING CONTENT FOR A SECTION
// =====================================================

router.get(
    "/section/:sectionId",
    authMiddleware,
    roleMiddleware("admin"),
    getSectionLearningContent
);


// =====================================================
// CREATE LEARNING CONTENT
// =====================================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    uploadLearningImage.single("visualImage"),
    createSectionLearningContent
);


// =====================================================
// UPDATE LEARNING CONTENT
// =====================================================

router.put(
    "/section/:sectionId",
    authMiddleware,
    roleMiddleware("admin"),
    uploadLearningImage.single("visualImage"),
    updateSectionLearningContent
);


module.exports = router;