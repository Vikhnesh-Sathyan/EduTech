
const express = require("express");
const router = express.Router();

const {
    getAvailableComparisons
} = require(
    "../../../../controllers/student/advanced/concept-comparison/conceptComparisonController"
);

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

router.get(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    getAvailableComparisons
);

module.exports = router;
