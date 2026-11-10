const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const debateController = require("../controllers/debate.controller");
const debateSessionController = require("../controllers/debate-session.controller");

// CREATE A NEW DEBATE SESSION
router.post(
    "/sessions",
    authMiddleware,
    roleMiddleware("student"),
    debateController.createSession
);

// SUBMIT AN ARGUMENT AND GET AI RESPONSE
router.post(
    "/respond",
    authMiddleware,
    roleMiddleware("student"),
    debateController.respond
);

// GET STUDENT DEBATE HISTORY
router.get(
    "/history",
    authMiddleware,
    roleMiddleware("student"),
    debateSessionController.getHistory
);

// GET ONE DEBATE SESSION WITH ITS ARGUMENTS AND EVALUATION
router.get(
    "/sessions/:sessionId",
    authMiddleware,
    roleMiddleware("student"),
    debateSessionController.getSessionDetails
);

// ABANDON AN ACTIVE DEBATE SESSION
router.patch(
    "/sessions/:sessionId/abandon",
    authMiddleware,
    roleMiddleware("student"),
    debateSessionController.abandonSession
);

module.exports = router;