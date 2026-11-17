
const express = require("express");
const router = express.Router();

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
    createCareerJob,
    getCareerJobs,
    approveCareerJob,
    rejectCareerJob,
    archiveCareerJob
} = require("../../../controllers/admin/careerHub/jobs/careerJobController");

// ==========================================
// INTERVIEW EXPERIENCES
// ==========================================

const {
    getInterviewExperiences,
    archiveInterviewExperience
} = require("../../../controllers/admin/careerHub/interviewExperiences/interviewExperienceController");

// ==========================================
// CAREER QUESTION CATEGORIES
// ==========================================

const {
    createQuestionCategory,
    getQuestionCategories,
    updateQuestionCategory,
    toggleQuestionCategoryStatus
} = require("../../../controllers/admin/careerHub/careerQuestions/questionCategoryController");

// ==========================================
// CAREER QUESTIONS
// ==========================================

const {
    getQuestionFormData,
    createCareerQuestion,
    getCareerQuestions,
    updateCareerQuestion,
    archiveCareerQuestion
} = require("../../../controllers/admin/careerHub/careerQuestions/careerQuestionController");

// ==========================================
// REFERRAL OPPORTUNITIES
// ==========================================

const careerReferralController = require(
    "../../../controllers/admin/careerHub/referrals/careerReferralController"
);

// ==========================================
// CAREER RESOURCES
// ==========================================

const {
    getCareerResources,
    previewCareerResource,
    archiveCareerResource
} = require("../../../controllers/admin/careerHub/resources/careerResourceController");


// ==========================================
// ADMIN JOB ROUTES
// ==========================================

// Get dropdown data for job creation
router.get(
    "/jobs/form-data",
    authMiddleware,
    roleMiddleware("admin"),
    getJobFormData
);

// Create and publish an admin job
router.post(
    "/jobs",
    authMiddleware,
    roleMiddleware("admin"),
    createCareerJob
);

// Get all career jobs
router.get(
    "/jobs",
    authMiddleware,
    roleMiddleware("admin"),
    getCareerJobs
);

// Approve a submitted job
router.patch(
    "/jobs/:jobId/approve",
    authMiddleware,
    roleMiddleware("admin"),
    approveCareerJob
);

// Reject a submitted job
router.patch(
    "/jobs/:jobId/reject",
    authMiddleware,
    roleMiddleware("admin"),
    rejectCareerJob
);

// Archive a job
router.patch(
    "/jobs/:jobId/archive",
    authMiddleware,
    roleMiddleware("admin"),
    archiveCareerJob
);


// ==========================================
// ADMIN INTERVIEW EXPERIENCE ROUTES
// ==========================================

// Get all interview experiences
router.get(
    "/interview-experiences",
    authMiddleware,
    roleMiddleware("admin"),
    getInterviewExperiences
);

// Archive an interview experience
router.patch(
    "/interview-experiences/:experienceId/archive",
    authMiddleware,
    roleMiddleware("admin"),
    archiveInterviewExperience
);


// ==========================================
// ADMIN QUESTION CATEGORY ROUTES
// ==========================================

// Create a question category
router.post(
    "/career-question-categories",
    authMiddleware,
    roleMiddleware("admin"),
    createQuestionCategory
);

// Get all question categories
router.get(
    "/career-question-categories",
    authMiddleware,
    roleMiddleware("admin"),
    getQuestionCategories
);

// Update a question category
router.put(
    "/career-question-categories/:categoryId",
    authMiddleware,
    roleMiddleware("admin"),
    updateQuestionCategory
);

// Activate or deactivate a question category
router.patch(
    "/career-question-categories/:categoryId/status",
    authMiddleware,
    roleMiddleware("admin"),
    toggleQuestionCategoryStatus
);


// ==========================================
// ADMIN CAREER QUESTION ROUTES
// ==========================================

// Get dropdown data for question creation
router.get(
    "/career-questions/form-data",
    authMiddleware,
    roleMiddleware("admin"),
    getQuestionFormData
);

// Create a career question
router.post(
    "/career-questions",
    authMiddleware,
    roleMiddleware("admin"),
    createCareerQuestion
);

// Get all career questions
router.get(
    "/career-questions",
    authMiddleware,
    roleMiddleware("admin"),
    getCareerQuestions
);

// Update a career question
router.put(
    "/career-questions/:questionId",
    authMiddleware,
    roleMiddleware("admin"),
    updateCareerQuestion
);

// Archive a career question
router.patch(
    "/career-questions/:questionId/archive",
    authMiddleware,
    roleMiddleware("admin"),
    archiveCareerQuestion
);


// ==========================================
// ADMIN REFERRAL ROUTES
// ==========================================

// Get all referral opportunities
router.get(
    "/referrals",
    authMiddleware,
    roleMiddleware("admin"),
    careerReferralController.getCareerReferrals
);

// Archive a referral opportunity
router.patch(
    "/referrals/:referralId/archive",
    authMiddleware,
    roleMiddleware("admin"),
    careerReferralController.archiveCareerReferral
);


// ==========================================
// ADMIN CAREER RESOURCE ROUTES
// ==========================================

// Get all career resources
router.get(
    "/resources",
    authMiddleware,
    roleMiddleware("admin"),
    getCareerResources
);

// Preview a published public PDF
router.get(
    "/resources/:resourceId/preview",
    authMiddleware,
    roleMiddleware("admin"),
    previewCareerResource
);

// Archive a published resource
router.patch(
    "/resources/:resourceId/archive",
    authMiddleware,
    roleMiddleware("admin"),
    archiveCareerResource
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
