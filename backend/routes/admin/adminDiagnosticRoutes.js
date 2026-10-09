const express = require("express");

const {
    createDiagnosticQuestion,
    updateDiagnosticQuestion,
    getDiagnosticQuestions,
    getDiagnosticSubjects,
    getDiagnosticTopics,
    importDiagnosticQuestions
} = require("../../controllers/admin/adminDiagnosticController");


const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const uploadDiagnosticFile = require("../../middleware/uploadDiagnosticFile");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createDiagnosticQuestion
);

router.post(
    "/import",
    authMiddleware,
    roleMiddleware("admin"),
    uploadDiagnosticFile.single("file"),
    importDiagnosticQuestions
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

