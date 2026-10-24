const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
    createQuiz,
    getMyQuizzes,
    getMyQuizById,
} = require("../../../controllers/mentor/advanced/theoryQuizController");

const {
    previewTheoryQuizCsv,
    importTheoryQuizCsv
} = require("../../../controllers/mentor/advanced/theoryQuizCsvController");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// CSV upload configuration
const uploadCsv = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.toLowerCase().endsWith(".csv")) {
            return cb(new Error("Only CSV files are allowed"));
        }

        cb(null, true);
    }
});

// All routes require an authenticated mentor
router.use(authMiddleware);
router.use(roleMiddleware("mentor"));

// Create a draft quiz
router.post("/", createQuiz);

// Get all quizzes created by this mentor
router.get("/", getMyQuizzes);

// Get one quiz owned by this mentor
router.get("/:quizId", getMyQuizById);

// Preview and validate an uploaded CSV
router.post(
    "/csv/preview",
    uploadCsv.single("file"),
    previewTheoryQuizCsv
);

router.post(
    "/csv/import",
    uploadCsv.single("file"),
    importTheoryQuizCsv
);

module.exports = router;
