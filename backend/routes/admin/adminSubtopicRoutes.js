const express = require("express");

const {
    getSubtopics,
    createSubtopic,
    updateSubtopic,
    updateSubtopicStatus
} = require("../../controllers/admin/adminSubtopicController");

const {
    getAdvancedSetup,
    createAdvancedSetup,
    updateAdvancedSetup,
    saveAdvancedModuleContent,
    getAdvancedModuleContent
} = require("../../controllers/admin/adminLearningAdvancedController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();


// Get all subtopics for a topic
router.get(
    "/topic/:topicId",
    authMiddleware,
    roleMiddleware("admin"),
    getSubtopics
);


// Create a subtopic
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createSubtopic
);


// Update a subtopic
router.put(
    "/:subtopicId",
    authMiddleware,
    roleMiddleware("admin"),
    updateSubtopic
);


// Enable / disable a subtopic
router.patch(
    "/:subtopicId/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateSubtopicStatus
);

// ======================================================
// ADVANCED LEARNING
// ======================================================

// Get Advanced setup for a subtopic
router.get(
    "/:subtopicId/advanced",
    authMiddleware,
    roleMiddleware("admin"),
    getAdvancedSetup
);

// Create Advanced setup for a subtopic
router.post(
    "/:subtopicId/advanced",
    authMiddleware,
    roleMiddleware("admin"),
    createAdvancedSetup
);

// ======================================================
// ADVANCED MODULE CONTENT
// ======================================================

// Get content for an Advanced module
router.get(
    "/advanced/modules/:moduleId/content",
    authMiddleware,
    roleMiddleware("admin"),
    getAdvancedModuleContent
);

// Create / update content for an Advanced module
router.put(
    "/advanced/modules/:moduleId/content",
    authMiddleware,
    roleMiddleware("admin"),
    saveAdvancedModuleContent
);

// Update Advanced module selection
router.put(
    "/:subtopicId/advanced",
    authMiddleware,
    roleMiddleware("admin"),
    updateAdvancedSetup
);


module.exports = router;

