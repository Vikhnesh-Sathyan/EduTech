
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const {
    getTechnologies
} = require("../../../controllers/mentor/cheatsheet/technologyController");

// All routes require mentor authentication
router.use(authMiddleware);
router.use(roleMiddleware("mentor"));

// GET /api/mentor/cheatsheet/technologies
router.get("/", getTechnologies);

module.exports = router;
