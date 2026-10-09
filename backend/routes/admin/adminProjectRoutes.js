const express = require("express");

const router = express.Router();

const {
    getProjectCategories,
    createProjectCategory,
    updateProjectCategory,
    deleteProjectCategory,

    getProjectTopics,
    createProjectTopic,
    updateProjectTopic,
    deleteProjectTopic,

    getProjectSections,
    createProjectSection,
    updateProjectSection,
    deleteProjectSection
} = require("../../controllers/admin/adminProjectController");

const {
    getProjectSectionContent,
    createProjectSectionContent,
    updateProjectSectionContent
} = require("../../controllers/admin/adminProjectContentController");

const authMiddleware =
    require("../../middleware/authMiddleware");

const roleMiddleware =
    require("../../middleware/roleMiddleware");

// Image upload middleware
const uploadLearningImage =
    require("../../middleware/uploadLearningImage");

// =====================================================
// GET ALL PROJECT CATEGORIES
// =====================================================

router.get(
    "/categories",
    authMiddleware,
    roleMiddleware("admin"),
    getProjectCategories
);


// =====================================================
// GET TOPICS BY CATEGORY
// =====================================================

router.get(
    "/categories/:categoryId/topics",
    authMiddleware,
    roleMiddleware("admin"),
    getProjectTopics
);

// =====================================================
// PROJECT CATEGORY MANAGEMENT
// =====================================================

// Get all categories
router.get(
    "/categories",
    authMiddleware,
    roleMiddleware("admin"),
    getProjectCategories
);

// Create category
router.post(
    "/categories",
    authMiddleware,
    roleMiddleware("admin"),
    createProjectCategory
);

// Update category
router.put(
    "/categories/:categoryId",
    authMiddleware,
    roleMiddleware("admin"),
    updateProjectCategory
);

// Delete category
router.delete(
    "/categories/:categoryId",
    authMiddleware,
    roleMiddleware("admin"),
    deleteProjectCategory
);

// =====================================================
// CREATE PROJECT TOPIC
// =====================================================

router.post(
    "/categories/:categoryId/topics",
    authMiddleware,
    roleMiddleware("admin"),
    createProjectTopic
);


// =====================================================
// UPDATE PROJECT TOPIC
// =====================================================

router.put(
    "/topics/:topicId",
    authMiddleware,
    roleMiddleware("admin"),
    updateProjectTopic
);


// =====================================================
// DELETE PROJECT TOPIC
// =====================================================

router.delete(
    "/topics/:topicId",
    authMiddleware,
    roleMiddleware("admin"),
    deleteProjectTopic
);

// =====================================================
// PROJECT SECTIONS
// =====================================================

// Get sections by topic
router.get(
    "/topics/:topicId/sections",
    authMiddleware,
    roleMiddleware("admin"),
    getProjectSections
);

// Create section
router.post(
    "/topics/:topicId/sections",
    authMiddleware,
    roleMiddleware("admin"),
    createProjectSection
);

// Update section
router.put(
    "/sections/:sectionId",
    authMiddleware,
    roleMiddleware("admin"),
    updateProjectSection
);

// Delete section
router.delete(
    "/sections/:sectionId",
    authMiddleware,
    roleMiddleware("admin"),
    deleteProjectSection
);

// =====================================================
// PROJECT SECTION CONTENT
// =====================================================

// Get section content
router.get(
    "/sections/:sectionId/content",
    authMiddleware,
    roleMiddleware("admin"),
    getProjectSectionContent
);


// Create section content
router.post(
    "/sections/:sectionId/content",
    authMiddleware,
    roleMiddleware("admin"),
    createProjectSectionContent
);


// Update section content
router.put(
    "/sections/:sectionId/content",
    authMiddleware,
    roleMiddleware("admin"),
    updateProjectSectionContent
);

// =====================================================
// PROJECT SECTION CONTENT IMAGE
// =====================================================

// Upload section content image
router.post(
    "/sections/:sectionId/content/image",
    authMiddleware,
    roleMiddleware("admin"),
    uploadLearningImage.single("photo"),
    async (req, res) => {

        try {

            if (!req.file) {
                return res.status(400).json({
                    message: "Image is required"
                });
            }

            const photoUrl =
                `/uploads/learning/${req.file.filename}`;

            res.status(200).json({
                message: "Image uploaded successfully",
                photo_url: photoUrl
            });

        } catch (error) {

            console.error(
                "Project content image upload error:",
                error
            );

            res.status(500).json({
                message: "Image upload failed"
            });
        }
    }
);

// =====================================================
// SECTION CONTENT
// =====================================================

router.get(
    "/sections/:sectionId/content",
    authMiddleware,
    roleMiddleware("admin"),
    getProjectSectionContent
);

router.post(
    "/sections/:sectionId/content",
    authMiddleware,
    roleMiddleware("admin"),
    createProjectSectionContent
);

router.put(
    "/sections/:sectionId/content",
    authMiddleware,
    roleMiddleware("admin"),
    updateProjectSectionContent
);

module.exports = router;

