const express = require("express");

const { protect, restrictTo } = require("../middleware/authMiddleware");

const { upload } = require("../services/multer");

const donationController = require("../controllers/donationController");
const authMiddleware = require("../middleware/authenticationMiddleware");
const uploadNeedPictures = require("../middleware/uploadNeedPictures");

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
  authMiddleware(["organization_donor"]),
  upload,
  // uploadNeedPictures,
  donationController.createMaterialDonation
);
//route for updating the requests for material donations
// router.post('/material/:id/request', donationController.requestMaterialDonation);

router.get(
  "/material",

  donationController.getAllMaterialDonations
);

router.post(
  "/material/:id/request",

  donationController.requestMaterialDonation
);
router.delete(
  "/material/:id/request",
  authMiddleware("ngo"),
  donationController.cancelMaterialDonationRequest
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
router.get(
  "/requestAccepted/:NGO",
  authMiddleware(["ngo"]),
  donationController.getDonationAcceptedForNGO
);
router.delete(
  "/delete-all-test", // Changed endpoint to make it clear this is for testing
  // Only requires authentication
  donationController.deleteAllDonations
);
module.exports = router;
