
const express = require("express");

const router = express.Router();

// Middleware
const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// Daily Quiz Controller
const {
    getAcademicOptions,
    createQuiz,
    getQuizDetails
} = require("../../../controllers/admin/daily-quiz/dailyQuiz.controller");

// Questions Controller
const {
    addQuizQuestions,
    updateQuizQuestions
} = require("../../../controllers/admin/daily-quiz/dailyQuizQuestions.controller");

const {
    getDailyQuizList
} = require("../../../controllers/admin/daily-quiz/dailyQuizList.controller");

const {
    updateDailyQuiz
} = require("../../../controllers/admin/daily-quiz/dailyQuizUpdate.controller");

const {
    deleteDailyQuiz
} = require("../../../controllers/admin/daily-quiz/dailyQuizDelete.controller");

const {
    publishDailyQuiz
} = require("../../../controllers/admin/daily-quiz/dailyQuizPublish.controller");

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// ==========================================
// ACADEMIC OPTIONS
// ==========================================
router.get("/academic-options", getAcademicOptions);

// ==========================================
// GET ADMIN DAILY QUIZ LIST
// ==========================================
router.get("/list", getDailyQuizList);

// ==========================================
// UPDATE DRAFT DAILY QUIZ
// ==========================================
router.put("/:quizId", updateDailyQuiz);

// ==========================================
// CREATE DAILY QUIZ
// ==========================================
router.post("/", createQuiz);

// ==========================================
// GET DAILY QUIZ DETAILS
// ==========================================
router.get("/:quizId", getQuizDetails);

// ==========================================
// ADD QUIZ QUESTIONS AND OPTIONS
// ==========================================
router.post("/:quizId/questions", addQuizQuestions);

// Add questions to a draft quiz
router.post("/:quizId/questions", addQuizQuestions);

// Replace questions in a draft quiz
router.put("/:quizId/questions", updateQuizQuestions);

// ==========================================
// DELETE DRAFT DAILY QUIZ
// ==========================================
router.delete("/:quizId", deleteDailyQuiz);

// Publish and schedule a daily quiz
router.patch("/:quizId/publish", publishDailyQuiz);

module.exports = router;
