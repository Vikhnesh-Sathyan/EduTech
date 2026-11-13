
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const {
    getDailyQuizDashboard
} = require("../../../controllers/student/dailyQuiz/dailyQuizController");

const {
    getDailyQuizQuestions
} = require("../../../controllers/student/dailyQuiz/quizQuestionsController");

const {
    submitDailyQuiz
} = require("../../../controllers/student/dailyQuiz/quizSubmissionController");

const {
    getDailyQuizResult
} = require("../../../controllers/student/dailyQuiz/quizResultController");

const {
    getDailyQuizHistory
} = require("../../../controllers/student/dailyQuiz/quizHistoryController"); 

const {
    getDailyQuizActivity
} = require("../../../controllers/student/dailyQuiz/quizActivityController");

const {
    getDailyQuizNotifications,
    getUnreadNotificationCount,
    markDailyQuizNotificationAsRead,
    markAllDailyQuizNotificationsAsRead
} = require("../../../controllers/student/dailyQuiz/dailyQuizNotificationController");

// =====================================================
// STUDENT DAILY QUIZ DASHBOARD
// =====================================================

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("student"),
    getDailyQuizDashboard
);

// Get Daily Quiz History
router.get(
    "/history",
    authMiddleware,
    roleMiddleware("student"),
    getDailyQuizHistory
);

// Get Daily Quiz Activity and Statistics
router.get(
    "/activity",
    authMiddleware,
    roleMiddleware("student"),
    getDailyQuizActivity
);

// =====================================================
// DAILY QUIZ NOTIFICATIONS
// =====================================================

router.get(
    "/notifications",
    authMiddleware,
    roleMiddleware("student"),
    getDailyQuizNotifications
);

router.get(
    "/notifications/unread-count",
    authMiddleware,
    roleMiddleware("student"),
    getUnreadNotificationCount
);

router.patch(
    "/notifications/read-all",
    authMiddleware,
    roleMiddleware("student"),
    markAllDailyQuizNotificationsAsRead
);

router.patch(
    "/notifications/:notificationId/read",
    authMiddleware,
    roleMiddleware("student"),
    markDailyQuizNotificationAsRead
);

// =====================================================
// GET DAILY QUIZ QUESTIONS
// =====================================================

router.get(
    "/:quizId/questions",
    authMiddleware,
    roleMiddleware("student"),
    getDailyQuizQuestions
);

// Submit Daily Quiz
router.post(
    "/:quizId/submit",
    authMiddleware,
    roleMiddleware("student"),
    submitDailyQuiz
);

// Get previously submitted Daily Quiz result
router.get(
    "/:quizId/result",
    authMiddleware,
    roleMiddleware("student"),
    getDailyQuizResult
);


module.exports = router;
