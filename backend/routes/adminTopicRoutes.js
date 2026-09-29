const express = require("express");

const {
    getTopicsBySubject,
    createTopic,
    updateTopic
} = require("../controllers/adminTopicController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// GET TOPICS BY SUBJECT
// ==========================================

router.get(
    "/subject/:subjectId",
    authMiddleware,
    roleMiddleware("admin"),
    getTopicsBySubject
);


// ==========================================
// CREATE TOPIC
// ==========================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createTopic
);

// ==========================================
// UPDATE TOPIC
// ==========================================

router.put(
    "/:topicId",
    authMiddleware,
    roleMiddleware("admin"),
    updateTopic
);

module.exports = router;