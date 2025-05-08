const express = require("express");
const router = express.Router();
const needsController = require("../controllers/donationManagement/needController");
const uploadNeedPictures = require("../middleware/uploadNeedPictures");
const authMiddleware = require("../middleware/authenticationMiddleware");
const donateItems = require("../controllers/donationManagement/donateItems");
const serviceApplication = require("../controllers/donationManagement/serviceApplication");
const paymentController = require("../controllers/paymentController");
// Post NGO's Need with file upload support
router.post(
  "/postNgosNeed",
  authMiddleware("ngo"),
  uploadNeedPictures, // Add the upload middleware
  needsController.postNgosNeed
);
router.get("/HomeNeeds", needsController.getHomeNeeds);
router.get(
  "/services",
  authMiddleware("ngo"),
  needsController.getAllNGOServiceNeeds
);
router.get("/services/all", needsController.getAllServiceNeeds);
// Other routes remain the same
//route for generating report
router.post(
  "/report",
  authMiddleware("ngo"),
  uploadNeedPictures,
  needsController.generateReport
);
router.get(
  "/reportPreview/:needId",
  authMiddleware("ngo"),
  needsController.getReportPreview
);
router.get("/reports", authMiddleware("ngo"), needsController.getReportByNgo);

router.get(
  "/statistics",
  authMiddleware("ngo"),
  needsController.getNGOStatistics
);
router.get("/report/:id", needsController.getReportById);
router.get("/getAllNeeds", needsController.getAllNeeds);

router.get("/ngo/:ngoId", needsController.getNeedsByNgo);
router.get(
  "/needsReports/:ngoId",
  needsController.getNeedsReportShouldGeneratedFor
);
router.get("/:id", needsController.getNeedById);
// Material Donation Routes
router.post(
  "/material",
  authMiddleware(["organization_donor", "individual_donor", "volunteer"]),
  uploadNeedPictures,
  donateItems.createMaterialDonation
);
router.put(
  "/updateStatus/:id",
  authMiddleware(["ngo"]),
  donateItems.updateDonationStatus
);
router.get("/material/:ngoId/:needId", donateItems.getMaterialDonation);
router.put("/material/:id", donateItems.updateMaterialDonation);
// Service Donation Routes
router.post(
  "/service",
  authMiddleware(["individual_donor", "organization_donor", "volunteer"]),
  serviceApplication.createServiceApplication
);
router.get("/service/:need", serviceApplication.getServiceDonations);
router.put(
  "/service/:id",
  authMiddleware("ngo"),
  serviceApplication.updateApplcationStatus
);
// router.put("/service/:id", serviceApplication.updateServiceDonation);
router.get("/money/:needId", paymentController.getMoneyDonations);
router.delete("/deleteNeed/:id", needsController.deleteNeed);
module.exports = router;
