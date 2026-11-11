
const express = require("express");
const router = express.Router();

const {
    getDailyQuizDashboard
} = require("../../../controllers/admin/dailyQuiz/dailyQuizController");

const {
    previewDailyQuizCsv
} = require("../../../controllers/admin/dailyQuiz/csvController");

const dailyQuizUpload = require("../../../middleware/daily-quiz/dailyQuizUploadMiddleware");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const {
    importDailyQuizCsv
} = require("../../../controllers/admin/dailyQuiz/csvImportController");

const {
    getQuestionBankQuestions,
    updateQuestionBankQuestion,
    archiveQuestionBankQuestion,
    restoreQuestionBankQuestion
} = require("../../../controllers/admin/dailyQuiz/questionBankController");

const {
    getAutomationSettings,
    saveAutomationSettings,
    updateAutomationStatus
} = require("../../../controllers/admin/dailyQuiz/automationController");

// ==========================================
// ADMIN DAILY QUIZ ROUTES
// ==========================================

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("admin"),
    getDailyQuizDashboard
);

// ==========================================
// CSV UPLOAD PREVIEW
// ==========================================

router.post(
    "/csv/preview",
    authMiddleware,
    roleMiddleware("admin"),
    dailyQuizUpload.single("file"),
    previewDailyQuizCsv
);

// ==========================================
// CSV IMPORT
// ==========================================

router.post(
    "/csv/import",
    authMiddleware,
    roleMiddleware("admin"),
    dailyQuizUpload.single("file"),
    importDailyQuizCsv
);

// ==========================================
// QUESTION BANK LIST
// ==========================================

router.get(
    "/question-bank",
    authMiddleware,
    roleMiddleware("admin"),
    getQuestionBankQuestions
);

router.put(
    "/question-bank/:questionId",
    authMiddleware,
    roleMiddleware("admin"),
    updateQuestionBankQuestion
);

router.patch(
    "/question-bank/:questionId/archive",
    authMiddleware,
    roleMiddleware("admin"),
    archiveQuestionBankQuestion
);

router.patch(
    "/question-bank/:questionId/restore",
    authMiddleware,
    roleMiddleware("admin"),
    restoreQuestionBankQuestion
);

router.get(
    "/automation",
    authMiddleware,
    roleMiddleware("admin"),
    getAutomationSettings
);

router.put(
    "/automation",
    authMiddleware,
    roleMiddleware("admin"),
    saveAutomationSettings
);

router.patch(
    "/automation/:subjectId/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateAutomationStatus
);

module.exports = router;
