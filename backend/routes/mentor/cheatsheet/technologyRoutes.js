
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const {
    getTechnologies,
    createTechnology,
    updateTechnology,
    deleteTechnology
} = require("../../../controllers/mentor/cheatsheet/technologyController");

// All routes require mentor authentication
router.use(authMiddleware);
router.use(roleMiddleware("mentor"));

// GET all active technologies
router.get("/", getTechnologies);

// CREATE a technology
router.post("/", createTechnology);

// UPDATE a technology created by the logged-in mentor
router.put("/:id", updateTechnology);

// DELETE a technology created by the logged-in mentor
router.delete("/:id", deleteTechnology);

module.exports = router;
