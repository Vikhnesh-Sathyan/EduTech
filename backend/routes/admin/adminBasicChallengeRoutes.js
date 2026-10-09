const express = require("express");
const multer = require("multer");

const {
  previewQuestions,
  confirmImport
} = require("../../controllers/admin/adminBasicChallengeController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

// Keep uploaded file in memory
const upload = multer({
  storage: multer.memoryStorage()
});

// Preview Excel / CSV questions
router.post(
  "/import/preview",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("file"),
  previewQuestions
);

router.post(
  "/:subtopicId/import/confirm",
  authMiddleware,
  roleMiddleware("admin"),
  confirmImport
);

module.exports = router;

