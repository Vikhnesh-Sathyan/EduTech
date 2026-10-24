
const express = require("express");
const router = express.Router();

const {
    getPublishedQuizzes,
    getTheoryQuizById
} = require("../../../controllers/student/advanced/theoryQuizController");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

router.get(
    "/theory-quizzes",
    authMiddleware,
    roleMiddleware("student"),
    getPublishedQuizzes
);

router.get(
    "/theory-quizzes/:quizId",
    authMiddleware,
    roleMiddleware("student"),
    getTheoryQuizById
);

module.exports = router;
