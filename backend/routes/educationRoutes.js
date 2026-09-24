// Defines protected student education lookup routes

const express = require("express");

const {
    getEducationPrograms,
    getDepartmentsByProgram,
    getEducationYearsByDepartment
} = require("../controllers/educationController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Get active education programs
router.get(
    "/programs",
    authMiddleware,
    roleMiddleware("student"),
    getEducationPrograms
);


// Get active departments for a program
router.get(
    "/departments/program/:programId",
    authMiddleware,
    roleMiddleware("student"),
    getDepartmentsByProgram
);


// Get active education years for a department
router.get(
    "/years/department/:departmentId",
    authMiddleware,
    roleMiddleware("student"),
    getEducationYearsByDepartment
);


module.exports = router;