// Defines protected admin department routes

const express = require("express");

const {
    createDepartment,
    getDepartments,
    getDepartmentsByProgram,
    updateDepartment,
    updateDepartmentStatus
} = require("../controllers/departmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Create a department
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createDepartment
);

// Get all departments for admin management
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getDepartments
);

// Get departments for an education program
router.get(
    "/program/:programId",
    authMiddleware,
    roleMiddleware("admin"),
    getDepartmentsByProgram
);


// Update a department
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateDepartment
);


// Activate or deactivate a department
router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateDepartmentStatus
);


module.exports = router;