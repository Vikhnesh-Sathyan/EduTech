
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
} = require("../../../controllers/student/careerHub/jobs/careerJobController");

// ==========================================
// INTERVIEW EXPERIENCES
// ==========================================

const {
    getFormData,
    submitInterviewExperience,
    getInterviewExperiences
} = require("../../../controllers/student/careerHub/interviewExperiences/interviewExperienceController");

// ==========================================
// CAREER QUESTIONS
// ==========================================

const careerQuestionController = require(
    "../../../controllers/student/careerHub/careerQuestions/careerQuestionController"
);

// ==========================================
// REFERRAL OPPORTUNITIES
// ==========================================

const careerReferralController = require(
    "../../../controllers/student/careerHub/referrals/careerReferralController"
);

// ==========================================
// CAREER RESOURCES
// ==========================================

const {
    uploadCareerResource,
    getCareerResources,
    getMyCareerResources,
    previewAnonymizedCopy,
    confirmResourcePublication,
    downloadCareerResource
} = require("../../../controllers/student/careerHub/resources/careerResourceController");

const {
    saveEditedCareerResource,
    getOriginalCareerResource
} = require("../../../controllers/student/careerHub/resources/careerResourceEditorController");


// ==========================================
// STUDENT JOB ROUTES
// ==========================================

router.get(
    "/jobs/form-data",
    authMiddleware,
    roleMiddleware("student"),
    getJobFormData
);

router.post(
    "/jobs",
    authMiddleware,
    roleMiddleware("student"),
    submitCareerJob
);

router.get(
    "/jobs",
    authMiddleware,
    roleMiddleware("student"),
    getCareerJobs
);


// ==========================================
// STUDENT INTERVIEW EXPERIENCE ROUTES
// ==========================================

router.get(
    "/interview-experiences/form-data",
    authMiddleware,
    roleMiddleware("student"),
    getFormData
);

router.post(
    "/interview-experiences",
    authMiddleware,
    roleMiddleware("student"),
    submitInterviewExperience
);

router.get(
    "/interview-experiences",
    authMiddleware,
    roleMiddleware("student"),
    getInterviewExperiences
);


// ==========================================
// STUDENT CAREER QUESTION ROUTES
// ==========================================

router.get(
    "/career-questions/form-data",
    authMiddleware,
    roleMiddleware("student"),
    careerQuestionController.getQuestionFormData
);

router.post(
    "/career-questions",
    authMiddleware,
    roleMiddleware("student"),
    careerQuestionController.submitCareerQuestion
);

router.get(
    "/career-questions",
    authMiddleware,
    roleMiddleware("student"),
    careerQuestionController.getCareerQuestions
);


// ==========================================
// STUDENT REFERRAL ROUTES
// ==========================================

router.get(
    "/referrals/form-data",
    authMiddleware,
    roleMiddleware("student"),
    careerReferralController.getReferralFormData
);

router.post(
    "/referrals",
    authMiddleware,
    roleMiddleware("student"),
    careerReferralController.submitCareerReferral
);

router.get(
    "/referrals",
    authMiddleware,
    roleMiddleware("student"),
    careerReferralController.getCareerReferrals
);


// ==========================================
// STUDENT CAREER RESOURCE ROUTES
// ==========================================

// Upload original PDF
router.post(
    "/resources",
    authMiddleware,
    roleMiddleware("student"),
    careerResourceUpload.single("document"),
    uploadCareerResource
);

// Browse published resources
router.get(
    "/resources",
    authMiddleware,
    roleMiddleware("student"),
    getCareerResources
);

// Get resources uploaded by the logged-in student
router.get(
    "/my-resources",
    authMiddleware,
    roleMiddleware("student"),
    getMyCareerResources
);

// Preview edited PDF before publication
router.get(
    "/resources/:resourceId/preview",
    authMiddleware,
    roleMiddleware("student"),
    previewAnonymizedCopy
);

// Confirm publication after reviewing the edited PDF
router.patch(
    "/resources/:resourceId/confirm-publication",
    authMiddleware,
    roleMiddleware("student"),
    confirmResourcePublication
);


// ==========================================
// STUDENT PDF EDITOR ROUTES
// ==========================================

// Save edited PDF pages as the public copy
router.post(
    "/resources/:resourceId/edited-copy",
    authMiddleware,
    roleMiddleware("student"),
    careerResourcePageUpload.array("pages", 20),
    saveEditedCareerResource
);

// Load the student's private original PDF
router.get(
    "/resources/:resourceId/original",
    authMiddleware,
    roleMiddleware("student"),
    getOriginalCareerResource
);

// Download a published public PDF
router.get(
    "/resources/:resourceId/download",
    authMiddleware,
    roleMiddleware("student"),
    downloadCareerResource
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
