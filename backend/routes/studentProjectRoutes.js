const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/AuthMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");

const {
    getStudentProjectCategories,
    getStudentProjectTopics,
    getStudentProjectSections,
    getStudentProjectSectionContent
} = require("../controllers/studentProjectController");


// =====================================================
// PROJECT CATEGORIES
// =====================================================

// Get active Project Understanding categories
router.get(
    "/categories",
    authMiddleware,
    roleMiddleware("student"),
    getStudentProjectCategories
);


// =====================================================
// PROJECT TOPICS
// =====================================================

// Get active topics for a category
router.get(
    "/categories/:categoryId/topics",
    authMiddleware,
    roleMiddleware("student"),
    getStudentProjectTopics
);


// =====================================================
// PROJECT SECTIONS
// =====================================================

// Get active sections for a topic
router.get(
    "/topics/:topicId/sections",
    authMiddleware,
    roleMiddleware("student"),
    getStudentProjectSections
);


// =====================================================
// SECTION CONTENT
// =====================================================

// Get content for a project section
router.get(
    "/sections/:sectionId/content",
    authMiddleware,
    roleMiddleware("student"),
    getStudentProjectSectionContent
);


module.exports = router;