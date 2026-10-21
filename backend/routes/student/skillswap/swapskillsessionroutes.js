
const express = require("express");
const router = express.Router();

const {
    scheduleSwapSession,
    getMySwapSessions,
    cancelSwapSession,
    completeSwapSession
} = require("../../../controllers/student/skillswap/swapskillsessioncontroller");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// Schedule a session for an accepted Skill Swap request
router.post(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    scheduleSwapSession
);

// Get sessions involving the logged-in student
router.get(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    getMySwapSessions
);

// Cancel a scheduled session
router.patch(
    "/:sessionId/cancel",
    authMiddleware,
    roleMiddleware("student"),
    cancelSwapSession
);

// Mark a session as completed
router.patch(
    "/:sessionId/complete",
    authMiddleware,
    roleMiddleware("student"),
    completeSwapSession
);

module.exports = router;
