const express = require("express");

const {
    getSectionLearningContent
} = require("../controllers/studentSectionLearningController");

const {
    accessLearningSection,
    completeLearningSection,
    getSubjectStudyProgress,
    getCurrentStudyProgress,
    getAllSubjectsStudyProgress
} = require("../controllers/studentStudyProgressController");

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/:sectionId/access",
    authMiddleware,
    roleMiddleware("student"),
    accessLearningSection
);

router.put(
    "/:sectionId/complete",
    authMiddleware,
    roleMiddleware("student"),
    completeLearningSection
);

router.get(
    "/progress/subject/:subjectId",
    authMiddleware,
    roleMiddleware("student"),
    getSubjectStudyProgress
);

router.get(
    "/progress/current",
    authMiddleware,
    roleMiddleware("student"),
    getCurrentStudyProgress
);

router.get(
    "/progress/subjects",
    authMiddleware,
    roleMiddleware("student"),
    getAllSubjectsStudyProgress
);

router.get(
    "/:sectionId",
    authMiddleware,
    roleMiddleware("student"),
    getSectionLearningContent
);

module.exports = router;