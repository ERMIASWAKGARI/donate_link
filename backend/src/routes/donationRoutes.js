const express = require("express");
const router = express.Router();
const needsController = require("../controllers/donationManagement/needController");
const uploadNeedPictures = require("../middleware/uploadNeedPictures");
const authMiddleware = require("../middleware/authenticationMiddleware");

// Post NGO's Need with file upload support
router.post(
  "/postNgosNeed",
  authMiddleware("ngo"),
  uploadNeedPictures, // Add the upload middleware
  needsController.postNgosNeed
);

// Other routes remain the same
router.get("/getAllNeeds", needsController.getAllNeeds);
router.get("/ngo/:ngoId", needsController.getNeedsByNgo);
router.get("/:id", needsController.getNeedById);

router.get("/services/all", needsController.getAllServiceNeeds);

module.exports = router;
