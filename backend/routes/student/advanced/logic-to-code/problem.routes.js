
const express = require("express");
const router = express.Router();

// =====================================================
// 1. AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// =====================================================

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

// =====================================================
// 2. IMPORT STUDENT CONTROLLERS
// =====================================================

// Dashboard
const {
    getStudentDashboard
} = require("../../../../controllers/student/advanced/logic-to-code/student-dashboard.controller");

// Problems
const {
    getPublishedProblems
} = require("../../../../controllers/student/advanced/logic-to-code/problem-list.controller");

const {
    getStudentProblemDetails
} = require("../../../../controllers/student/advanced/logic-to-code/problem-details.controller");

// Bookmarks
const {
    addProblemBookmark,
    removeProblemBookmark,
    getBookmarkedProblems
} = require("../../../../controllers/student/advanced/logic-to-code/problem-bookmark.controller");

// Notes
const {
    createStudentNote
} = require("../../../../controllers/student/advanced/logic-to-code/notes/note-create.controller");

const {
    getStudentNotes
} = require("../../../../controllers/student/advanced/logic-to-code/notes/note-list.controller");

const {
    getStudentNoteById
} = require("../../../../controllers/student/advanced/logic-to-code/notes/note-details.controller");

const {
    updateStudentNote
} = require("../../../../controllers/student/advanced/logic-to-code/notes/note-update.controller");

const {
    deleteStudentNote
} = require("../../../../controllers/student/advanced/logic-to-code/notes/note-delete.controller");

const {
    toggleStudentNotePin
} = require("../../../../controllers/student/advanced/logic-to-code/notes/note-pin.controller");

// Discussions
const {
    createDiscussion
} = require("../../../../controllers/student/advanced/logic-to-code/discussion-create.controller");

const {
    getProblemDiscussions
} = require("../../../../controllers/student/advanced/logic-to-code/discussion-list.controller");

const {
    updateDiscussion
} = require("../../../../controllers/student/advanced/logic-to-code/discussion-update.controller");

const {
    deleteDiscussion
} = require("../../../../controllers/student/advanced/logic-to-code/discussion-delete.controller");

const {
    reportDiscussion
} = require("../../../../controllers/student/advanced/logic-to-code/discussion-report.controller");

// Code submissions
const {
    createStudentSubmission
} = require("../../../../controllers/student/advanced/logic-to-code/submission-create.controller");

const {
    executeStudentSubmission
} = require("../../../../controllers/student/advanced/logic-to-code/submission-execute.controller");

const {
    getStudentSubmissionDetails
} = require("../../../../controllers/student/advanced/logic-to-code/submission-details.controller");

const {
    getStudentSubmissionHistory
} = require("../../../../controllers/student/advanced/logic-to-code/submission-list.controller");

// Learning resources
const {
    getPublicTestCases
} = require("../../../../controllers/student/advanced/logic-to-code/test-case.controller");

const {
    getStudentProblemHints
} = require("../../../../controllers/student/advanced/logic-to-code/problem-hints.controller");

const {
    getStudentProblemSteps
} = require("../../../../controllers/student/advanced/logic-to-code/problem-steps.controller");

const {
    getStudentProblemMistakes
} = require("../../../../controllers/student/advanced/logic-to-code/problem-mistakes.controller");

const {
    getStudentReferenceSolutions
} = require("../../../../controllers/student/advanced/logic-to-code/solution.controller");

// =====================================================
// 3. APPLY AUTHENTICATION & STUDENT ROLE CHECK
// =====================================================

// Every route below requires a valid login.
// Only users with the student role can access these routes.

router.use(authMiddleware);
router.use(roleMiddleware("student"));

// =====================================================
// 4. STUDENT DASHBOARD
// =====================================================

// Get dashboard statistics and recent activity.
router.get("/dashboard", getStudentDashboard);

// =====================================================
// 5. PROBLEM BROWSING
// =====================================================

// Get all published problems with search and filters.
router.get("/problems", getPublishedProblems);

// Get details of one published problem.
router.get("/problems/:problemId", getStudentProblemDetails);

// =====================================================
// 6. BOOKMARK MANAGEMENT
// =====================================================

// Get all problems bookmarked by the logged-in student.
router.get("/bookmarks", getBookmarkedProblems);

// Bookmark a problem.
router.post("/problems/:problemId/bookmark", addProblemBookmark);

// Remove a problem from bookmarks.
router.delete("/problems/:problemId/bookmark", removeProblemBookmark);

// =====================================================
// 7. STUDENT NOTES
// =====================================================

// Create a new personal note.
router.post("/notes", createStudentNote);

// Get all personal notes.
router.get("/notes", getStudentNotes);

// Get one note by its ID.
router.get("/notes/:noteId", getStudentNoteById);

// Update an existing note.
router.put("/notes/:noteId", updateStudentNote);

// Delete a note.
router.delete("/notes/:noteId", deleteStudentNote);

// Pin or unpin a note.
router.patch("/notes/:noteId/pin", toggleStudentNotePin);

// =====================================================
// 8. DISCUSSION & REPLY MANAGEMENT
// =====================================================

// Create a discussion or reply under a problem.
router.post("/problems/:problemId/discussions", createDiscussion);

// Get discussions and replies for a problem.
router.get("/problems/:problemId/discussions", getProblemDiscussions);

// Edit your own discussion or reply.
router.put("/discussions/:discussionId", updateDiscussion);

// Delete your own discussion or reply.
router.delete("/discussions/:discussionId", deleteDiscussion);

// Report a discussion or reply.
router.post("/discussions/:discussionId/report", reportDiscussion);

// =====================================================
// 9. CODE SUBMISSIONS & EXECUTION
// =====================================================

// Submit source code for a problem.
router.post("/problems/:problemId/submissions", createStudentSubmission);

// Execute a pending code submission.
router.post("/submissions/:submissionId/execute", executeStudentSubmission);

// Get details and execution results of one submission.
router.get("/submissions/:submissionId", getStudentSubmissionDetails);

// Get the student's submission history.
router.get("/submissions", getStudentSubmissionHistory);

// =====================================================
// 10. PROBLEM LEARNING RESOURCES
// =====================================================

// Get public test cases only.
router.get("/problems/:problemId/test-cases", getPublicTestCases);

// Get hints for a problem.
router.get("/problems/:problemId/hints", getStudentProblemHints);

// Get step-by-step problem guidance.
router.get("/problems/:problemId/steps", getStudentProblemSteps);

// Get common mistakes for a problem.
router.get("/problems/:problemId/mistakes", getStudentProblemMistakes);

// Get reference solutions when the unlock conditions are satisfied.
router.get("/problems/:problemId/solutions", getStudentReferenceSolutions);

// =====================================================
// 11. EXPORT ROUTER
// =====================================================

module.exports = router;
