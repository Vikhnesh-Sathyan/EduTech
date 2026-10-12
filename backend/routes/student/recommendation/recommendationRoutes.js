
const express = require("express");
const router = express.Router();

const resourceRoutes = require("./resourceRoutes");

// Learning Resources
router.use("/resources", resourceRoutes);

module.exports = router;
