
const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");
const resourceUpload = require("../../../middleware/recommendation/resourceUpload");

const {
    getApprovedResources,
    getPendingResources,
    submitResource,
    getMyResources,
    approveResource,
    rejectResource,
    updateResource,
    deleteResource
} = require("../../../controllers/student/recommendations/resourceController");

// STUDENT: View approved resources
router.get(
    "/approved",
    authMiddleware,
    getApprovedResources
);

// ADMIN: View pending resources
router.get(
    "/pending",
    authMiddleware,
    getPendingResources
);

// STUDENT: View own submissions
router.get(
    "/my",
    authMiddleware,
    getMyResources
);

// STUDENT: Submit a resource
router.post(
    "/",
    authMiddleware,
    resourceUpload.single("file"),
    submitResource
);

// STUDENT: Edit own resource
router.put(
    "/:id",
    authMiddleware,
    resourceUpload.single("file"),
    updateResource
);

// STUDENT: Delete own resource
router.delete(
    "/:id",
    authMiddleware,
    deleteResource
);

// ADMIN: Approve a resource
router.patch(
    "/:id/approve",
    authMiddleware,
    approveResource
);

// ADMIN: Reject a resource
router.patch(
    "/:id/reject",
    authMiddleware,
    rejectResource
);

module.exports = router;
