const express = require("express");

const {
    startDiagnostic,
    submitAnswer
} = require("../controllers/diagnosticController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Start diagnostic for a subject
router.post(
    "/subjects/:subjectId/start",
    authMiddleware,
    roleMiddleware("student"),
    startDiagnostic
);

router.post(
    "/:attemptId/answer",
    authMiddleware,
    roleMiddleware("student"),
    submitAnswer
);

module.exports = router;