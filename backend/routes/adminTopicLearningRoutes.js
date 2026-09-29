const express = require("express");

const {
    createTopicLearningContent,
    updateTopicLearningContent,
    getTopicLearningContent
} = require("../controllers/adminTopicLearningController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const uploadLearningImage = require("../middleware/uploadLearningImage");

const router = express.Router();


// =====================================================
// GET LEARNING CONTENT
// =====================================================

router.get(
    "/:topicId",
    authMiddleware,
    roleMiddleware("admin"),
    getTopicLearningContent
);


// =====================================================
// CREATE LEARNING CONTENT
// =====================================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    uploadLearningImage.single("visualImage"),
    createTopicLearningContent
);


// =====================================================
// UPDATE LEARNING CONTENT
// =====================================================

router.put(
    "/:topicId",
    authMiddleware,
    roleMiddleware("admin"),
    uploadLearningImage.single("visualImage"),
    updateTopicLearningContent
);


module.exports = router;