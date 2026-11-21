
const express = require("express");
const router = express.Router();

// ==========================================
// UPLOAD CONFIGURATIONS
// ==========================================

const careerResourceUpload = require("../../../config/careerResourceUpload");
const careerResourcePageUpload = require("../../../config/careerResourcePageUpload");

// ==========================================
// MIDDLEWARE
// ==========================================

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// ==========================================
// JOB OPPORTUNITIES
// ==========================================

const {
    getJobFormData,
    submitCareerJob,
    getCareerJobs
} = require("../../../controllers/mentor/careerHub/jobs/careerJobController");

// ==========================================
// INTERVIEW EXPERIENCES
// ==========================================

const {
    getFormData,
    submitInterviewExperience,
    getInterviewExperiences
} = require("../../../controllers/mentor/careerHub/interviewExperiences/interviewExperienceController");

// ==========================================
// CAREER QUESTIONS
// ==========================================

const {
    getQuestionFormData,
    submitCareerQuestion,
    getCareerQuestions
} = require("../../../controllers/mentor/careerHub/careerQuestions/careerQuestionController");

// ==========================================
// REFERRAL OPPORTUNITIES
// ==========================================

const careerReferralController = require(
    "../../../controllers/mentor/careerHub/referrals/careerReferralController"
);

// ==========================================
// CAREER RESOURCES
// ==========================================

const {
    uploadCareerResource,
    getCareerResources,
    getMyCareerResources,
    getResourceFormData,
    previewAnonymizedCopy,
    confirmResourcePublication,
    downloadCareerResource
} = require("../../../controllers/mentor/careerHub/resources/careerResourceController");

const {
    saveEditedCareerResource,
    getOriginalCareerResource
} = require("../../../controllers/mentor/careerHub/resources/careerResourceEditorController");


// ==========================================
// MENTOR JOB ROUTES
// ==========================================

router.get(
    "/jobs/form-data",
    authMiddleware,
    roleMiddleware("mentor"),
    getJobFormData
);

router.post(
    "/jobs",
    authMiddleware,
    roleMiddleware("mentor"),
    submitCareerJob
);

router.get(
    "/jobs",
    authMiddleware,
    roleMiddleware("mentor"),
    getCareerJobs
);


// ==========================================
// MENTOR INTERVIEW EXPERIENCE ROUTES
// ==========================================

router.get(
    "/interview-experiences/form-data",
    authMiddleware,
    roleMiddleware("mentor"),
    getFormData
);

router.post(
    "/interview-experiences",
    authMiddleware,
    roleMiddleware("mentor"),
    submitInterviewExperience
);

router.get(
    "/interview-experiences",
    authMiddleware,
    roleMiddleware("mentor"),
    getInterviewExperiences
);


// ==========================================
// MENTOR CAREER QUESTION ROUTES
// ==========================================

router.get(
    "/career-questions/form-data",
    authMiddleware,
    roleMiddleware("mentor"),
    getQuestionFormData
);

router.post(
    "/career-questions",
    authMiddleware,
    roleMiddleware("mentor"),
    submitCareerQuestion
);

router.get(
    "/career-questions",
    authMiddleware,
    roleMiddleware("mentor"),
    getCareerQuestions
);


// ==========================================
// MENTOR REFERRAL ROUTES
// ==========================================

router.get(
    "/referrals/form-data",
    authMiddleware,
    roleMiddleware("mentor"),
    careerReferralController.getReferralFormData
);

router.post(
    "/referrals",
    authMiddleware,
    roleMiddleware("mentor"),
    careerReferralController.submitCareerReferral
);

router.get(
    "/referrals",
    authMiddleware,
    roleMiddleware("mentor"),
    careerReferralController.getCareerReferrals
);

// ==========================================
// MENTOR CAREER RESOURCE ROUTES
// ==========================================

// Upload original PDF
router.post(
    "/resources",
    authMiddleware,
    roleMiddleware("mentor"),
    careerResourceUpload.single("document"),
    uploadCareerResource
);

// Get resources uploaded by the logged-in mentor
router.get(
    "/my-resources",
    authMiddleware,
    roleMiddleware("mentor"),
    getMyCareerResources
);

// Preview edited PDF before publication
router.get(
    "/resources/:resourceId/preview",
    authMiddleware,
    roleMiddleware("mentor"),
    previewAnonymizedCopy
);

// Confirm publication after reviewing the edited PDF
router.patch(
    "/resources/:resourceId/confirm-publication",
    authMiddleware,
    roleMiddleware("mentor"),
    confirmResourcePublication
);

// ==========================================
// BROWSE PUBLISHED RESOURCES
// ==========================================

router.get(
    "/resources",
    authMiddleware,
    roleMiddleware("mentor"),
    getCareerResources
);

// ==========================================
// RESOURCE FORM DATA
// ==========================================

router.get(
    "/resources/form-data",
    authMiddleware,
    roleMiddleware("mentor"),
    getResourceFormData
);

// ==========================================
// DOWNLOAD PUBLISHED RESOURCE
// ==========================================

router.get(
    "/resources/:resourceId/download",
    authMiddleware,
    roleMiddleware("mentor"),
    downloadCareerResource
);


// ==========================================
// MENTOR PDF EDITOR ROUTES
// ==========================================

// Save edited PDF pages as the public copy
router.post(
    "/resources/:resourceId/edited-copy",
    authMiddleware,
    roleMiddleware("mentor"),
    careerResourcePageUpload.array("pages", 20),
    saveEditedCareerResource
);

// Load the mentor's private original PDF
router.get(
    "/resources/:resourceId/original",
    authMiddleware,
    roleMiddleware("mentor"),
    getOriginalCareerResource
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
