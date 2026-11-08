const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const conversationController = require("../controllers/conversation.controller");


router.post(
    "/chat",
    authMiddleware,
    roleMiddleware("student"),
    conversationController.chat
);


module.exports = router;