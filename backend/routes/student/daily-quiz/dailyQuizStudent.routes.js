
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const {
    getTodayDailyQuizzes,
    getDailyQuizQuestions,
    submitDailyQuiz
} = require("../../../controllers/student/daily-quiz/dailyQuizStudent.controller");

const {
    getDailyQuizResult
} = require("../../../controllers/student/daily-quiz/dailyQuizResult.controller");

const {
    getDailyQuizHistory
} = require("../../../controllers/student/daily-quiz/dailyQuizHistory.controller");

const {
    getDailyQuizStreak
} = require("../../../controllers/student/daily-quiz/dailyQuizStreak.controller");

const {
    getDailyQuizNotifications,
    markDailyQuizNotificationRead,
    markAllDailyQuizNotificationsRead
} = require("../../../controllers/student/daily-quiz/dailyQuizNotification.controller");

// Authentication and student role protection
router.use(authMiddleware);
router.use(roleMiddleware("student"));

// Get today's available daily quizzes
router.get("/today", getTodayDailyQuizzes);

router.get("/:quizId/questions", getDailyQuizQuestions);

router.post("/:quizId/submit", submitDailyQuiz);

router.get("/:quizId/result", getDailyQuizResult);

router.get("/history", getDailyQuizHistory);

router.get("/streak", getDailyQuizStreak);

// ==========================================
// DAILY QUIZ NOTIFICATIONS
// ==========================================

router.get(
    "/notifications",
    getDailyQuizNotifications
);

router.patch(
    "/notifications/read-all",
    markAllDailyQuizNotificationsRead
);

router.patch(
    "/notifications/:notificationId/read",
    markDailyQuizNotificationRead
);

module.exports = router;
