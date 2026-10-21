const express = require("express");
const router = express.Router();

const {
    discoverStudents
} = require("../../../controllers/student/skillswap/swapskilldiscoverycontroller");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

router.get(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    discoverStudents
);

module.exports = router;