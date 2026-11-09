
const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const topicEvaluationController = require(
    "../controllers/topic-evaluation.controller"
);


router.post(
    "/evaluate",
    authMiddleware,
    roleMiddleware("student"),
    topicEvaluationController.evaluate
);

router.get(
    "/attempts/:attemptId",
    authMiddleware,
    roleMiddleware("student"),
    topicEvaluationController.getEvaluationDetails
);


module.exports = router;
