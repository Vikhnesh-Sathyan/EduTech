
const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const debateEvaluationController = require(
    "../controllers/debate-evaluation.controller"
);


router.post(
    "/evaluate",
    authMiddleware,
    roleMiddleware("student"),
    debateEvaluationController.evaluate
);


module.exports = router;
