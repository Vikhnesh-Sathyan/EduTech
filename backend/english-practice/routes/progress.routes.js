
const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const progressController = require(
    "../controllers/progress.controller"
);


router.get(
    "/report",
    authMiddleware,
    roleMiddleware("student"),
    progressController.generateReport
);


module.exports = router;
