// Defines protected admin education program routes

const express = require("express");

const {
    createEducationProgram,
    getEducationPrograms,
    updateEducationProgram,
    updateEducationProgramStatus,
    getDepartmentsByEducationProgram
} = require("../../controllers/admin/educationProgramController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();


// Create an education program
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createEducationProgram
);


// Get all education programs
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getEducationPrograms
);

// Get education programs for mentors (read-only)
router.get(
    "/mentor",
    authMiddleware,
    roleMiddleware("mentor"),
    getEducationPrograms
);

// Update an education program
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateEducationProgram
);


// Activate or deactivate an education program
router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateEducationProgramStatus
);

router.get(
    "/:programId/departments",
    authMiddleware,
    roleMiddleware("mentor"),
    getDepartmentsByEducationProgram
);


module.exports = router;

