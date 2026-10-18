
const express = require("express");
const router = express.Router();

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
const authMiddleware = require("../../../middleware/authMiddleware");

// ==========================================
// CODING SOLUTION CONTROLLER
// ==========================================
const {
    createCodeSolution,
    updateCodeSolution,
    getCodeSolutions
} = require("../../../controllers/student/recommendations/codingSolutionController");

// ==========================================
// CODE HIGHLIGHTS
// ==========================================
const {
    createCodeHighlight,
    updateCodeHighlight,
    deleteCodeHighlight,
    getCodeHighlights,
   
} = require("../../../controllers/student/recommendations/codingLearningController");


// ==========================================
//  ALGORITHM STEPS
// ==========================================

const {
    
    createAlgorithmSteps,
    getAlgorithmSteps,
    updateAlgorithmStep,
    deleteAlgorithmStep
} = require("../../../controllers/student/recommendations/codingAlgorithmController");

const {
    generateAlgorithm
} = require("../../../controllers/student/recommendations/codingAlgorithmGeneratorController");

// ==========================================
// FLOWCHART CONTROLLER
// ==========================================
const {
    createCodeFlowchart,
    getCodeFlowchart
} = require("../../../controllers/student/recommendations/codingFlowchartController");

// ==========================================
// CODING QUESTION CONTROLLER
// ==========================================
const {
    createCodePost,
    getAllCodePosts,
    getCodePostById
} = require("../../../controllers/student/recommendations/codingPostController");

// ==========================================
// CODE ANIMATION CONTROLLER
// ==========================================
const {
    createCodeAnimationSteps,
    getCodeAnimationSteps
} = require("../../../controllers/student/recommendations/codingAnimationController");

const {
    generateCodeAnimation
} = require("../../../controllers/student/recommendations/codingAnimationGeneratorController");

// ==========================================
// BOOKMARK CONTROLLER
// ==========================================
const {
    bookmarkCodePost,
    removeCodeBookmark,
    getMyCodeBookmarks
} = require("../../../controllers/student/recommendations/codingBookmarkController");

// ==========================================
// VOTE CONTROLLER
// ==========================================
const {
    voteCodePost,
    getCodePostVotes
} = require("../../../controllers/student/recommendations/codingVoteController");

// ==========================================
// CODING QUESTION ROUTES
// ==========================================

// Get all published coding questions.
router.get("/", authMiddleware, getAllCodePosts);

// Create a new coding question.
router.post("/", authMiddleware, createCodePost);

// Get my bookmarked coding questions.
// Keep this before the generic question ID route.
router.get("/bookmarks", authMiddleware, getMyCodeBookmarks);

// Get the student's bookmarked coding questions (legacy URL).
router.get("/my-bookmarks", authMiddleware, getMyCodeBookmarks);

// Get a specific coding question by ID.
router.get("/:id", authMiddleware, getCodePostById);

// ==========================================
// CODING SOLUTION ROUTES
// ==========================================

// Add a solution to a coding question.
router.post("/:id/solutions", authMiddleware, createCodeSolution);

// Get all solutions for a coding question.
router.get("/:postId/solutions", authMiddleware, getCodeSolutions);

// Update an existing coding solution.
router.put("/solutions/:solutionId", authMiddleware, updateCodeSolution);


// ==========================================
// CODE HIGHLIGHT ROUTES
// ==========================================

// Add highlighted code lines and explanations.
router.post(
    "/solutions/:solutionId/highlights",
    authMiddleware,
    createCodeHighlight
);

// Get highlights for a solution.
router.get(
    "/solutions/:solutionId/highlights",
    authMiddleware,
    getCodeHighlights
);

// Update an existing code highlight.
router.put(
    "/solutions/:solutionId/highlights/:highlightId",
    authMiddleware,
    updateCodeHighlight
);

// Delete a code highlight.
router.delete(
    "/solutions/:solutionId/highlights/:highlightId",
    authMiddleware,
    deleteCodeHighlight
);


// ==========================================
// ALGORITHM STEP ROUTES
// ==========================================

// Create algorithm steps for a solution.
router.post(
    "/solutions/:solutionId/algorithm-steps",
    authMiddleware,
    createAlgorithmSteps
);

// Get algorithm steps for a solution.
router.get(
    "/solutions/:solutionId/algorithm-steps",
    authMiddleware,
    getAlgorithmSteps
);

// Update an algorithm step.
router.put(
    "/solutions/:solutionId/algorithm-steps/:stepId",
    authMiddleware,
    updateAlgorithmStep
);

// Delete an algorithm step.
router.delete(
    "/solutions/:solutionId/algorithm-steps/:stepId",
    authMiddleware,
    deleteAlgorithmStep
);

router.post(
    "/solutions/:solutionId/algorithm-generate",
    authMiddleware,
    generateAlgorithm
);


// ==========================================
// FLOWCHART ROUTES
// ==========================================

// Create a flowchart for a solution.
router.post(
    "/solutions/:solutionId/flowcharts",
    authMiddleware,
    createCodeFlowchart
);

// Get the flowchart for a solution.
router.get(
    "/solutions/:solutionId/flowcharts",
    authMiddleware,
    getCodeFlowchart
);


// ==========================================
// CODE ANIMATION ROUTES
// ==========================================

// Generate animation steps using Gemini.
router.post(
    "/solutions/:solutionId/animation-generate",
    authMiddleware,
    generateCodeAnimation
);

// Create animation steps for a solution.
router.post(
    "/solutions/:solutionId/animation-steps",
    authMiddleware,
    createCodeAnimationSteps
);

// Get animation steps for a solution.
router.get(
    "/solutions/:solutionId/animation-steps",
    authMiddleware,
    getCodeAnimationSteps
);


// ==========================================
// BOOKMARK ROUTES
// ==========================================

// Bookmark a coding question.
router.post("/:postId/bookmark", authMiddleware, bookmarkCodePost);

// Remove a bookmark from a coding question.
router.delete("/:postId/bookmark", authMiddleware, removeCodeBookmark);

// ==========================================
// VOTE ROUTES
// ==========================================

// Vote on a coding question or update an existing vote.
router.post("/:postId/vote", authMiddleware, voteCodePost);

// Get vote counts for a coding question.
router.get("/:postId/votes", authMiddleware, getCodePostVotes);



// ==========================================
// EXPORT ROUTER
// ==========================================
module.exports = router;
