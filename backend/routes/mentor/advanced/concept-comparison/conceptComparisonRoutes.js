const express = require("express");
const router = express.Router();

const {
  createComparison,
  getMyComparisons,
} = require('../../../../controllers/mentor/advanced/concept-comparison/conceptComparisonController');

const {
    getComparisonById
} = require("../../../../controllers/mentor/advanced/concept-comparison/comparisonDetailsController");

const {
    addComparisonRow,
    updateComparisonRow,
    deleteComparisonRow
} = require("../../../../controllers/mentor/advanced/concept-comparison/comparisonRowController");

const {
    publishComparison,
    unpublishComparison
} = require(
    "../../../../controllers/mentor/advanced/concept-comparison/comparisonPublishController"
);

const authMiddleware = require("../../../../middleware/authMiddleware");
const roleMiddleware = require("../../../../middleware/roleMiddleware");

// Create a new concept comparison as a draft.
router.post(
    "/",
    authMiddleware,
    roleMiddleware("mentor"),
    createComparison
);

router.get(
  '/mine',
  authMiddleware,
  roleMiddleware('mentor'),
  getMyComparisons
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('mentor'),
  getComparisonById
);

router.post(
    "/:id/rows",
    authMiddleware,
    roleMiddleware("mentor"),
    addComparisonRow
);

router.put(
    "/rows/:rowId",
    authMiddleware,
    roleMiddleware("mentor"),
    updateComparisonRow
);

router.delete(
    "/rows/:rowId",
    authMiddleware,
    roleMiddleware("mentor"),
    deleteComparisonRow
);

router.patch(
    "/:id/publish",
    authMiddleware,
    roleMiddleware("mentor"),
    publishComparison
);

router.patch(
    "/:id/unpublish",
    authMiddleware,
    roleMiddleware("mentor"),
    unpublishComparison
);

module.exports = router;