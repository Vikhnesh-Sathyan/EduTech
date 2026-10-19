
const express = require("express");
const router = express.Router();

// Authentication and role middleware
const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// Technology controller
const {
    getTechnologies,
    createTechnology,
    updateTechnology,
    deleteTechnology
} = require("../../../controllers/admin/cheatsheet/technologyController");

// All routes require an authenticated Admin
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// GET all technologies
router.get("/", getTechnologies);

// CREATE technology
router.post("/", createTechnology);

// UPDATE technology
router.put("/:id", updateTechnology);

// DELETE technology
router.delete("/:id", deleteTechnology);

module.exports = router;
