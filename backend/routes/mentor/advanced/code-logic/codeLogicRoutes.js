const express = require("express");
const router = express.Router();

const {
    getAvailableLanguages,
    getMyConcepts,
    createProblem,
} = require(
    "../../../../controllers/mentor/advanced/code-logic/codeLogicController"
);

const {
    getMyProblems,
    getProblemById
} = require(
    "../../../../controllers/mentor/advanced/code-logic/getCodeLogicProblemsController"
);

const {
    updateProblem
} = require(
    "../../../../controllers/mentor/advanced/code-logic/updateCodeLogicProblemController"
);

const {
    publishProblem,
    unpublishProblem,
    deactivateProblem,
    reactivateProblem
} = require(
    "../../../../controllers/mentor/advanced/code-logic/manageCodeLogicProblemController"
);

const {
    deleteDraftProblem
} = require(
    "../../../../controllers/mentor/advanced/code-logic/deleteCodeLogicProblemController"
);

const authMiddleware = require(
    "../../../../middleware/authMiddleware"
);

const roleMiddleware = require(
    "../../../../middleware/roleMiddleware"
);

const {
    importProblemsFromCSV
} = require(
    "../../../../controllers/mentor/advanced/code-logic/importCodeLogicProblemsController"
);

// =====================================================
// LOGIC TO CODE MENTOR ROUTES
// =====================================================

// GET active programming languages
router.get(
    "/languages",
    authMiddleware,
    roleMiddleware("mentor"),
    getAvailableLanguages
);

// GET active Logic to Code concepts
router.get(
    "/concepts",
    authMiddleware,
    roleMiddleware("mentor"),
    getMyConcepts
);

// CREATE LOGIC TO CODE PROBLEM
router.post(
    "/problems",
    authMiddleware,
    roleMiddleware("mentor"),
    createProblem
);

// GET ALL PROBLEMS CREATED BY THE MENTOR
router.get(
    "/problems",
    authMiddleware,
    roleMiddleware("mentor"),
    getMyProblems
);

// GET ONE PROBLEM WITH FULL CONTENT
router.get(
    "/problems/:problemId",
    authMiddleware,
    roleMiddleware("mentor"),
    getProblemById
);

// UPDATE A DRAFT PROBLEM
router.put(
    "/problems/:problemId",
    authMiddleware,
    roleMiddleware("mentor"),
    updateProblem
);

// PUBLISH A DRAFT PROBLEM
router.patch(
    "/problems/:problemId/publish",
    authMiddleware,
    roleMiddleware("mentor"),
    publishProblem
);

// UNPUBLISH A PROBLEM
router.patch(
    "/problems/:problemId/unpublish",
    authMiddleware,
    roleMiddleware("mentor"),
    unpublishProblem
);

// DEACTIVATE A PROBLEM
router.patch(
    "/problems/:problemId/deactivate",
    authMiddleware,
    roleMiddleware("mentor"),
    deactivateProblem
);

// REACTIVATE AN INACTIVE PROBLEM
router.patch(
    "/problems/:problemId/reactivate",
    authMiddleware,
    roleMiddleware("mentor"),
    reactivateProblem
);

// IMPORT LOGIC TO CODE PROBLEMS FROM CSV
router.post(
    "/problems/import-csv",
    authMiddleware,
    roleMiddleware("mentor"),
    importProblemsFromCSV
);

// DELETE A DRAFT PROBLEM
router.delete(
    "/problems/:problemId",
    authMiddleware,
    roleMiddleware("mentor"),
    deleteDraftProblem
);
module.exports = router;