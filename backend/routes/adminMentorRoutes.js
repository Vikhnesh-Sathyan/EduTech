// Defines protected admin mentor verification routes

const express = require("express");

const {
  getPendingMentors,
  approveMentor,
  rejectMentor
} = require("../controllers/adminMentorController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Get mentors waiting for verification
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("admin"),
  getPendingMentors
);

// Approve mentor
router.put(
  "/:mentorId/approve",
  authMiddleware,
  roleMiddleware("admin"),
  approveMentor
);

// Reject mentor
router.put(
  "/:mentorId/reject",
  authMiddleware,
  roleMiddleware("admin"),
  rejectMentor
);

module.exports = router;