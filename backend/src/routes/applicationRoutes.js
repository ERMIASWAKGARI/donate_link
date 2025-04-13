const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.use(protect);

router.post(
  "/:needId/apply",

  applicationController.createApplication
);

// NGO routes
router.get(
  "/needs/:needId/applications",

  applicationController.getNeedApplications
);

router.patch(
  "/:id",

  applicationController.updateApplicationStatus
);

router.patch(
  "/bulk",

  applicationController.bulkUpdateApplications
);

// Needs routes
router.get(
  "/ngos/:ngoId/needs",

  applicationController.getNgoNeeds
);

module.exports = router;
