
const express = require("express");

const {
    importTechnologies
} = require("../../../controllers/admin/cheatsheet/importController");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const router = express.Router();

// Import technologies from the CSV file.
router.post(
    "/technologies",
    authMiddleware,
    roleMiddleware("admin"),
    importTechnologies
);

module.exports = router;
