// =====================================================
// IMPORT EXPRESS
// =====================================================

const express = require("express");
const router = express.Router();

// =====================================================
// IMPORT MIDDLEWARE
// =====================================================

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

// =====================================================
// IMPORT PROBLEM CONTROLLERS
// =====================================================

const {
    createProblem,
    getMentorProblems,
    getProblemById,
    updateProblem
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem.controller");

const {
    deleteProblem
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-delete.controller");

const {
    updateProblemStatus
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-status.controller");

// =====================================================
// IMPORT LEARNING SUPPORT CONTROLLERS
// =====================================================

const {
    addProblemSteps,
    getProblemSteps
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-steps.controller");

const {
    saveProblemSupport,
    getProblemSupport
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-support.controller");

const {
    saveProblemHints,
    getProblemHints
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-hints.controller");

const {
    addProblemMistake,
    getProblemMistakes,
    updateProblemMistake,
    deleteProblemMistake
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-mistakes.controller");

const {
    addTestCase,
    getTestCases,
    updateTestCase,
    deleteTestCase
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-test-cases.controller");

const {
    addProblemSolution,
    getProblemSolutions
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-solutions.controller");

const {
    updateProblemSolution
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-solutions-update.controller");

const {
    deleteProblemSolution
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-solutions-delete.controller");

// =====================================================
// IMPORT DASHBOARD CONTROLLER
// =====================================================

const {
    getMentorProblemDashboard
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-dashboard.controller");

// =====================================================
// IMPORT SUBMISSION CONTROLLERS
// =====================================================

const {
    getMentorSubmissions
} = require("../../../../controllers/mentor/advanced/logic-to-code/submissions-list.controller");

const {
    getMentorSubmissionDetails
} = require("../../../../controllers/mentor/advanced/logic-to-code/submission-details.controller");

const {
    updateSubmissionFeedback
} = require("../../../../controllers/mentor/advanced/logic-to-code/submission-feedback.controller");

// =====================================================
// IMPORT DISCUSSION CONTROLLERS
// =====================================================

const {
    getMentorProblemDiscussions
} = require("../../../../controllers/mentor/advanced/logic-to-code/discussion-list.controller");

const {
    replyToDiscussion
} = require("../../../../controllers/mentor/advanced/logic-to-code/discussion-reply.controller");

const {
    deleteDiscussion
} = require("../../../../controllers/mentor/advanced/logic-to-code/discussion-delete.controller");

// =====================================================
// IMPORT DISCUSSION REPORT CONTROLLERS
// =====================================================

const {
    getMentorDiscussionReports
} = require("../../../../controllers/mentor/advanced/logic-to-code/discussion-reports-list.controller");

const {
    reviewDiscussionReport
} = require("../../../../controllers/mentor/advanced/logic-to-code/discussion-report-review.controller");


// =====================================================
// APPLY MENTOR AUTHENTICATION TO ALL ROUTES
// =====================================================

router.use(authMiddleware);
router.use(roleMiddleware("mentor"));


// =====================================================
// 1. DASHBOARD ROUTES
// =====================================================

router.get("/dashboard", getMentorProblemDashboard);


// =====================================================
// 2. SUBMISSION ROUTES
// =====================================================

router.get("/submissions", getMentorSubmissions);

router.get(
    "/submissions/:submissionId",
    getMentorSubmissionDetails
);

router.patch(
    "/submissions/:submissionId/feedback",
    updateSubmissionFeedback
);


// =====================================================
// 3. DISCUSSION REPORT ROUTES
// =====================================================

router.get(
    "/discussion-reports",
    getMentorDiscussionReports
);

router.patch(
    "/discussion-reports/:reportId/review",
    reviewDiscussionReport
);


// =====================================================
// 4. PROBLEM CRUD ROUTES
// =====================================================

router.post("/", createProblem);

router.get("/", getMentorProblems);

router.get("/:problemId", getProblemById);

router.put("/:problemId", updateProblem);

router.delete("/:problemId", deleteProblem);

router.patch(
    "/:problemId/status",
    updateProblemStatus
);


// =====================================================
// 5. PROBLEM STEPS ROUTES
// =====================================================

router.post(
    "/:problemId/steps",
    addProblemSteps
);

router.get(
    "/:problemId/steps",
    getProblemSteps
);


// =====================================================
// 6. PROBLEM SUPPORT ROUTES
// =====================================================

router.post(
    "/:problemId/support",
    saveProblemSupport
);

router.get(
    "/:problemId/support",
    getProblemSupport
);


// =====================================================
// 7. PROBLEM HINTS ROUTES
// =====================================================

router.post(
    "/:problemId/hints",
    saveProblemHints
);

router.get(
    "/:problemId/hints",
    getProblemHints
);


// =====================================================
// 8. COMMON MISTAKES ROUTES
// =====================================================

router.post(
    "/:problemId/mistakes",
    addProblemMistake
);

router.get(
    "/:problemId/mistakes",
    getProblemMistakes
);

router.put(
    "/:problemId/mistakes/:mistakeId",
    updateProblemMistake
);

router.delete(
    "/:problemId/mistakes/:mistakeId",
    deleteProblemMistake
);


// =====================================================
// 9. TEST CASE ROUTES
// =====================================================

router.post(
    "/:problemId/test-cases",
    addTestCase
);

router.get(
    "/:problemId/test-cases",
    getTestCases
);

router.put(
    "/:problemId/test-cases/:testCaseId",
    updateTestCase
);

router.delete(
    "/:problemId/test-cases/:testCaseId",
    deleteTestCase
);


// =====================================================
// 10. REFERENCE SOLUTION ROUTES
// =====================================================

router.post(
    "/:problemId/solutions",
    addProblemSolution
);

router.get(
    "/:problemId/solutions",
    getProblemSolutions
);

router.put(
    "/:problemId/solutions/:solutionId",
    updateProblemSolution
);

router.delete(
    "/:problemId/solutions/:solutionId",
    deleteProblemSolution
);


// =====================================================
// 11. PROBLEM DISCUSSION ROUTES
// =====================================================

router.get(
    "/:problemId/discussions",
    getMentorProblemDiscussions
);

router.post(
    "/:problemId/discussions/:discussionId/replies",
    replyToDiscussion
);

router.delete(
    "/:problemId/discussions/:discussionId",
    deleteDiscussion
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;