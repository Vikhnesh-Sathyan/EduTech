
const express = require("express");
const router = express.Router();

const {
    getPublishedQuizzes,
    getTheoryQuizById
} = require("../../../controllers/student/advanced/theoryQuizController");

const {
    startOrResumeAttempt,
    getTheoryQuizAttemptStatus
} = require("../../../controllers/student/advanced/theoryQuizAttemptController");

const {
    submitTheoryQuizAttempt
} = require("../../../controllers/student/advanced/theoryQuizSubmitController");

const {
    saveTheoryQuizProgress
} = require("../../../controllers/student/advanced/theoryQuizProgressController");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// List published quizzes
router.get(
    "/theory-quizzes",
    authMiddleware,
    roleMiddleware("student"),
    getPublishedQuizzes
);

// Get quiz details
router.get(
    "/theory-quizzes/:quizId",
    authMiddleware,
    roleMiddleware("student"),
    getTheoryQuizById
);

// Check the latest attempt without creating a new attempt
router.get(
    "/theory-quizzes/:quizId/attempt/status",
    authMiddleware,
    roleMiddleware("student"),
    getTheoryQuizAttemptStatus
);

// Start a new attempt or resume an existing one
router.post(
    "/theory-quizzes/:quizId/attempt",
    authMiddleware,
    roleMiddleware("student"),
    startOrResumeAttempt
);

router.post(
    "/theory-quizzes/:quizId/attempt/:attemptId/submit",
    authMiddleware,
    roleMiddleware("student"),
    submitTheoryQuizAttempt
);

router.post(
    "/theory-quizzes/:quizId/attempt/:attemptId/progress",
    authMiddleware,
    roleMiddleware("student"),
    saveTheoryQuizProgress
);

module.exports = router;
