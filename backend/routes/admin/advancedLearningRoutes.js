const express = require("express");
const router = express.Router();

const {
    getAdvancedSetup,
    createAdvancedSetup,
    updateAdvancedSetup,
    saveAdvancedModuleContent,
    getAdvancedModuleContent
} = require("../../controllers/admin/adminLearningAdvancedController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// Get Advanced setup for a section
router.get(
    "/:sectionId",
    authMiddleware,
    roleMiddleware("admin"),
    getAdvancedSetup
);

// Create Advanced setup for a section
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createAdvancedSetup
);

// Update Advanced setup for a section
router.put(
    "/:sectionId",
    authMiddleware,
    roleMiddleware("admin"),
    updateAdvancedSetup
);

// Get module content
router.get(
    "/modules/:moduleId/content",
    authMiddleware,
    roleMiddleware("admin"),
    getAdvancedModuleContent
);

// Save/update module content
router.put(
    "/modules/:moduleId/content",
    authMiddleware,
    roleMiddleware("admin"),
    saveAdvancedModuleContent
);

module.exports = router;