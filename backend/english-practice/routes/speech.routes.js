
const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const speechUpload = require("../utils/speech-upload");
const speechController = require("../controllers/speech.controller");


router.use(authMiddleware);
router.use(roleMiddleware("student"));


// Upload audio and save speaking attempt
router.post(
    "/transcribe",
    speechUpload.single("file"),
    speechController.transcribe
);


// Get student's speaking history
router.get(
    "/history",
    speechController.getHistory
);


module.exports = router;
