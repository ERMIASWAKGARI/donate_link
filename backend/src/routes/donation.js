const express = require("express");

const { protect, restrictTo } = require("../middleware/authMiddleware");

const { upload } = require("../services/multer");

const donationController = require("../controllers/donationController");

const router = express.Router();

// Apply protect middleware to ALL donation routes
router.use(protect);

router.use((req, res, next) => {
  console.log("Current user:", req.user?.id, req.user?.role);
  next();
});
// Material Donation Routes
router.post(
  "/non-material",
  upload, // Now matches frontend field name
  donationController.createOtherDonation
);
router.post(
  "/material",
  upload, // Now matches frontend field name
  donationController.createMaterialDonation
);

router.get(
  "/material",

  donationController.getAllMaterialDonations
);

router.post(
  "/material/:id/request",

  donationController.requestMaterialDonation
);

router.patch(
  "/material/:id/respond",

  donationController.respondToDonationRequest
);

router.patch(
  "/material/:id/complete",

  donationController.completeDonation
);

router.get(
  "/tracking/:trackingId",

  donationController.getDonationByTrackingId
);

module.exports = router;
