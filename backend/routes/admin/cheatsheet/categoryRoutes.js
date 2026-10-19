
const express = require("express");
const router = express.Router();

// Authentication and role middleware
const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// Category controller
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../../../controllers/admin/cheatsheet/categoryController");

// Admin-only access
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// GET categories for a technology
router.get("/technology/:technologyId", getCategories);

// CREATE category under a technology
router.post("/technology/:technologyId", createCategory);

// UPDATE category
router.put("/:id", updateCategory);

// DELETE category
router.delete("/:id", deleteCategory);

module.exports = router;
