const express = require("express");

const {
    startDiagnostic,
    submitAnswer,
    completeDiagnostic,
    getDiagnosticResult
} = require('../../controllers/student/diagnosticController');

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

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

router.post(
    "/:attemptId/complete",
    authMiddleware,
    roleMiddleware("student"),
    completeDiagnostic
);

router.get(
    '/subjects/:subjectId/result',
    authMiddleware,
    roleMiddleware("student"),
    getDiagnosticResult
);



module.exports = router;

