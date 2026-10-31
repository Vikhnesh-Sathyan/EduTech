
const express = require("express");
const router = express.Router();

// =====================================================
// 1. AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// =====================================================

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

// =====================================================
// 2. IMPORT MENTOR CONTROLLERS
// =====================================================

// Dashboard
const {
    getMentorProblemDashboard
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-dashboard.controller");

// Problem Management
const {
    createProblem,
    getMentorProblems,
    getProblemById,
    updateProblem,
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem.controller");

const {
    deleteProblem
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-delete.controller");

const {
    updateProblemStatus
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-status.controller");

// Problem Learning Resources
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

// Test Cases
const {
    addTestCase,
    getTestCases,
    updateTestCase,
    deleteTestCase
} = require("../../../../controllers/mentor/advanced/logic-to-code/problem-test-cases.controller");

// Reference Solutions
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

// Student Submissions
const {
    getMentorSubmissions
} = require("../../../../controllers/mentor/advanced/logic-to-code/submissions-list.controller");

const {
    getMentorSubmissionDetails
} = require("../../../../controllers/mentor/advanced/logic-to-code/submission-details.controller");

const {
    updateSubmissionFeedback
} = require("../../../../controllers/mentor/advanced/logic-to-code/submission-feedback.controller");

// Problem Discussions
const {
    getMentorProblemDiscussions
} = require("../../../../controllers/mentor/advanced/logic-to-code/discussion-list.controller");

const {
    replyToDiscussion
} = require("../../../../controllers/mentor/advanced/logic-to-code/discussion-reply.controller");

const {
    deleteDiscussion
} = require("../../../../controllers/mentor/advanced/logic-to-code/discussion-delete.controller");

// Discussion Reports
const {
    getMentorDiscussionReports
} = require("../../../../controllers/mentor/advanced/logic-to-code/discussion-reports-list.controller");

const {
    reviewDiscussionReport
} = require("../../../../controllers/mentor/advanced/logic-to-code/discussion-report-review.controller");

// =====================================================
// 3. APPLY AUTHENTICATION & MENTOR ROLE CHECK
// =====================================================

// Every route below requires a valid login.
// Only users with the mentor role can access these routes.

router.use(authMiddleware);
router.use(roleMiddleware("mentor"));

// =====================================================
// 4. MENTOR DASHBOARD
// =====================================================

// Get dashboard statistics and problem activity.
router.get("/dashboard", getMentorProblemDashboard);

// =====================================================
// 5. STUDENT SUBMISSION MANAGEMENT
// =====================================================

// Get submissions for the mentor's problems.
router.get("/submissions", getMentorSubmissions);

// Get details of one student submission.
router.get("/submissions/:submissionId", getMentorSubmissionDetails);

// Add or update feedback for a submission.
router.patch(
    "/submissions/:submissionId/feedback",
    updateSubmissionFeedback
);

// =====================================================
// 6. DISCUSSION REPORT MANAGEMENT
// =====================================================

// View reports submitted by students.
router.get("/discussion-reports", getMentorDiscussionReports);

// Review a reported discussion.
router.patch(
    "/discussion-reports/:reportId/review",
    reviewDiscussionReport
);

// =====================================================
// 7. PROBLEM MANAGEMENT (CRUD)
// =====================================================

// Create a new Logic to Code problem.
router.post("/", createProblem);

// Get all problems created by the logged-in mentor.
router.get("/", getMentorProblems);

// Get details of one problem.
router.get("/:problemId", getProblemById);

// Update an existing problem.
router.put("/:problemId", updateProblem);

// Delete a problem.
router.delete("/:problemId", deleteProblem);

// Change problem status (draft, published, archived).
router.patch("/:problemId/status", updateProblemStatus);

// =====================================================
// 8. PROBLEM STEP MANAGEMENT
// =====================================================

// Add or save step-by-step guidance for a problem.
router.post("/:problemId/steps", addProblemSteps);

// Get steps for a problem.
router.get("/:problemId/steps", getProblemSteps);

// =====================================================
// 9. PROBLEM SUPPORT CODE MANAGEMENT
// =====================================================

// Save starter code and other problem support information.
router.post("/:problemId/support", saveProblemSupport);

// Get saved problem support information.
router.get("/:problemId/support", getProblemSupport);

// =====================================================
// 10. PROBLEM HINT MANAGEMENT
// =====================================================

// Save hints for a problem.
router.post("/:problemId/hints", saveProblemHints);

// Get hints for a problem.
router.get("/:problemId/hints", getProblemHints);

// =====================================================
// 11. COMMON MISTAKE MANAGEMENT
// =====================================================

// Add a common mistake.
router.post("/:problemId/mistakes", addProblemMistake);

// Get all common mistakes for a problem.
router.get("/:problemId/mistakes", getProblemMistakes);

// Update a common mistake.
router.put(
    "/:problemId/mistakes/:mistakeId",
    updateProblemMistake
);

// Delete a common mistake.
router.delete(
    "/:problemId/mistakes/:mistakeId",
    deleteProblemMistake
);

// =====================================================
// 12. TEST CASE MANAGEMENT
// =====================================================

// Add a test case to a problem.
router.post("/:problemId/test-cases", addTestCase);

// Get test cases for a problem.
router.get("/:problemId/test-cases", getTestCases);

// Update an existing test case.
router.put(
    "/:problemId/test-cases/:testCaseId",
    updateTestCase
);

// Delete a test case.
router.delete(
    "/:problemId/test-cases/:testCaseId",
    deleteTestCase
);

// =====================================================
// 13. REFERENCE SOLUTION MANAGEMENT
// =====================================================

// Add a reference solution.
router.post("/:problemId/solutions", addProblemSolution);

// Get reference solutions for a problem.
router.get("/:problemId/solutions", getProblemSolutions);

// Update a reference solution.
router.put(
    "/:problemId/solutions/:solutionId",
    updateProblemSolution
);

// Delete a reference solution.
router.delete(
    "/:problemId/solutions/:solutionId",
    deleteProblemSolution
);

// =====================================================
// 14. PROBLEM DISCUSSION MANAGEMENT
// =====================================================

// Get discussions and replies for a problem.
router.get("/:problemId/discussions", getMentorProblemDiscussions);

// Reply to a student's discussion.
router.post(
    "/:problemId/discussions/:discussionId/replies",
    replyToDiscussion
);

// Delete a discussion or reply.
router.delete(
    "/:problemId/discussions/:discussionId",
    deleteDiscussion
);

// =====================================================
// 15. EXPORT ROUTER
// =====================================================

module.exports = router;
