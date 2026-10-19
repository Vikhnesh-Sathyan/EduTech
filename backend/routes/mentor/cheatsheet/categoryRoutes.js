
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../../../controllers/mentor/cheatsheet/categoryController");

router.use(authMiddleware);
router.use(roleMiddleware("mentor"));

// GET categories for a technology
router.get("/technology/:technologyId", getCategories);

// CREATE category under a technology
router.post("/technology/:technologyId", createCategory);

// UPDATE own category
router.put("/:id", updateCategory);

// DELETE own category
router.delete("/:id", deleteCategory);

module.exports = router;
