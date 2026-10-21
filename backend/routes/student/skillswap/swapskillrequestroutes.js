
const express = require("express");
const router = express.Router();

const {
    sendSwapRequest,
    getMySwapRequests,
    respondToSwapRequest,
    cancelSwapRequest
} = require("../../../controllers/student/skillswap/swapskillrequestcontroller");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// Send a Skill Swap request.
router.post(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    sendSwapRequest
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    getMySwapRequests
);

router.patch(
    "/:requestId/respond",
    authMiddleware,
    roleMiddleware("student"),
    respondToSwapRequest
);

// Cancel a pending request sent by the logged-in student
router.patch(
    "/:requestId/cancel",
    authMiddleware,
    roleMiddleware("student"),
    cancelSwapRequest
);
module.exports = router;
