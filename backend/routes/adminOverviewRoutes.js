// Defines the API route used by the admin dashboard to load overview statistics

const express = require("express");

const {
    getOverview
} = require("../controllers/adminOverviewController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getOverview
);

module.exports = router;