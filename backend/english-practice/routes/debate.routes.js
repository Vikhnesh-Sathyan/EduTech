const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const debateController = require("../controllers/debate.controller");


router.post(
    "/respond",
    authMiddleware,
    roleMiddleware("student"),
    debateController.respond
);


module.exports = router;