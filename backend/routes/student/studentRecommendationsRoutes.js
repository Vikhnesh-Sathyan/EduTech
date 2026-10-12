const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const uploadResource = require("../../middleware/resourceUpload");

// =====================================================
// IMPORT RESOURCE CONTROLLER
// =====================================================

const {
    getApprovedResources,
    createResource,
    getMyResources
} = require("../../controllers/student/recommendations/resourceController");

// =====================================================
// IMPORT COMMUNITY DOUBT CONTROLLER
// =====================================================

const {
    getApprovedDoubts,
    createDoubt,
    getMyDoubts,
    getDoubtReplies,
    createReply
} = require("../../controllers/student/recommendations/communityDoubtController");

// =====================================================
// IMPORT INTERVIEW PREP CONTROLLER
// =====================================================

const {
    getApprovedInterviewPrep,
    createInterviewPrep,
    getMyInterviewPrep
} = require("../../controllers/student/recommendations/interviewPrepController");


// =====================================================
// RESOURCE ROUTES
// =====================================================

// Get approved resources for a subject
router.get(
    "/resources",
    authMiddleware,
    roleMiddleware("student"),
    getApprovedResources
);

// Get the logged-in student's resource submissions
router.get(
    "/resources/my",
    authMiddleware,
    roleMiddleware("student"),
    getMyResources
);

// Submit a resource for admin approval
router.post(
    "/resources",
    authMiddleware,
    roleMiddleware("student"),
    uploadResource,
    createResource
);


// =====================================================
// COMMUNITY DOUBT ROUTES
// =====================================================

// Get approved doubts for a subject
router.get(
    "/doubts",
    authMiddleware,
    roleMiddleware("student"),
    getApprovedDoubts
);

// Get the logged-in student's doubt submissions
router.get(
    "/doubts/my",
    authMiddleware,
    roleMiddleware("student"),
    getMyDoubts
);

// Submit a doubt for admin approval
router.post(
    "/doubts",
    authMiddleware,
    roleMiddleware("student"),
    createDoubt
);

// Get replies for an approved doubt
router.get(
    "/doubts/:doubtId/replies",
    authMiddleware,
    roleMiddleware("student"),
    getDoubtReplies
);

// Post a reply immediately, without admin approval
router.post(
    "/doubts/:doubtId/replies",
    authMiddleware,
    roleMiddleware("student"),
    createReply
);


// =====================================================
// INTERVIEW PREP ROUTES
// =====================================================

// Get approved interview preparation content
router.get(
    "/interview-prep",
    authMiddleware,
    roleMiddleware("student"),
    getApprovedInterviewPrep
);

// Get the logged-in student's interview prep submissions
router.get(
    "/interview-prep/my",
    authMiddleware,
    roleMiddleware("student"),
    getMyInterviewPrep
);

// Submit interview preparation content for admin approval
router.post(
    "/interview-prep",
    authMiddleware,
    roleMiddleware("student"),
    createInterviewPrep
);


module.exports = router;