// Defines protected admin education year routes

const express = require("express");

const {
    createEducationYear,
    getEducationYears,
    getEducationYearsByDepartment,
    updateEducationYear,
    updateEducationYearStatus
} = require("../controllers/educationYearController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Create an education year
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createEducationYear
);

// Get all education years for admin management
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getEducationYears
);

// Get education years for a department
router.get(
    "/department/:departmentId",
    authMiddleware,
    roleMiddleware("admin"),
    getEducationYearsByDepartment
);



// Update an education year
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateEducationYear
);


// Activate or deactivate an education year
router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateEducationYearStatus
);




module.exports = router;