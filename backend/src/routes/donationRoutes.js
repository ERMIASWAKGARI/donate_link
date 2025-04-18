const express = require("express");
const router = express.Router();
const needsController = require("../controllers/donationManagement/needController");
const uploadNeedPictures = require("../middleware/uploadNeedPictures");
const authMiddleware = require("../middleware/authenticationMiddleware");
const donateItems = require("../controllers/donationManagement/donateItems");
const serviceApplication = require("../controllers/donationManagement/serviceApplication");
// Post NGO's Need with file upload support
router.post(
  "/postNgosNeed",
  authMiddleware("ngo"),
  uploadNeedPictures, // Add the upload middleware
  needsController.postNgosNeed
);
router.get("/services",authMiddleware("ngo"), needsController.getAllNGOServiceNeeds);
router.get("/services/all", needsController.getAllServiceNeeds);
// Other routes remain the same
//route for generating report
router.post("/report/:needId", authMiddleware("ngo"),uploadNeedPictures, needsController.generateReport);

router.get("/getAllNeeds", needsController.getAllNeeds);
router.get("/ngo/:ngoId", needsController.getNeedsByNgo);
router.get("/:id", needsController.getNeedById);
// Material Donation Routes
router.post("/material",authMiddleware("individual_donor" || "organization_donor"),uploadNeedPictures, donateItems.createMaterialDonation);
router.get("/material/:ngoId/:needId", donateItems.getMaterialDonation);
router.put("/material/:id", donateItems.updateMaterialDonation);

// Service Donation Routes
router.post("/service", authMiddleware("individual_donor" || "organization_donor" || "volunteer"), serviceApplication.createServiceApplication);
router.get("/service/:need", serviceApplication.getServiceDonations);
router.put("/service/:id",authMiddleware("ngo"), serviceApplication.updateApplcationStatus);
// router.put("/service/:id", serviceApplication.updateServiceDonation);
module.exports = router;
