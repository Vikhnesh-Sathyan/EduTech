const express = require("express");

const {
    createDiagnosticQuestion,
    updateDiagnosticQuestion,
    getDiagnosticQuestions,
    getDiagnosticSubjects,
    getDiagnosticTopics
} = require("../controllers/adminDiagnosticController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createDiagnosticQuestion
);

router.put(
    "/:questionId",
    authMiddleware,
    roleMiddleware("admin"),
    updateDiagnosticQuestion
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getDiagnosticQuestions
);

router.get(
    "/subjects",
    authMiddleware,
    roleMiddleware("admin"),
    getDiagnosticSubjects
);

router.get(
    "/subjects/:subjectId/topics",
    authMiddleware,
    roleMiddleware("admin"),
    getDiagnosticTopics
);

module.exports = router;