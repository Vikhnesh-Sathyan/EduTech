const express = require("express");

const {
  getChallengeQuestions,
  getChallengeStatus,
  submitChallenge,
  startNewChallengeCycle,
  getChallengeHistory
} = require("../../controllers/student/studentBasicChallengeController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// GET BASIC CHALLENGE STATUS
// ======================================================

router.get(
  "/:subtopicId/status",
  authMiddleware,
  roleMiddleware("student"),
  getChallengeStatus
);

// ======================================================
// GET 5 RANDOM BASIC CHALLENGE QUESTIONS
// ======================================================

router.get(
  "/:subtopicId/questions",
  authMiddleware,
  roleMiddleware("student"),
  getChallengeQuestions
);

// ======================================================
// SUBMIT BASIC CHALLENGE
// ======================================================

router.post(
  "/:subtopicId/submit",
  authMiddleware,
  roleMiddleware("student"),
  submitChallenge
);

// START A NEW BASIC CHALLENGE CYCLE

router.post(
  "/:subtopicId/new-cycle",
  authMiddleware,
  roleMiddleware("student"),
  startNewChallengeCycle
);

router.get(
  "/:subtopicId/history",
  authMiddleware,
  roleMiddleware("student"),
  getChallengeHistory
); 
module.exports = router;


