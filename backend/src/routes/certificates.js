const express = require("express");
const router = express.Router();
const sendSuccessResponse = require("../utils/responseHelper");
const certificateController = require("../controllers/certificateController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, certificateController.getUserCertificates);
router.get("/download/:id", protect, certificateController.downloadCertificate);

router.post("/trigger-check", protect, async (req, res, next) => {
  try {
    await certificateController.checkCertificates(req.user._id, req.user.role);
    sendSuccessResponse(res, 200, {
      message: "Certificate eligibility check completed successfully",
      userId: req.user._id,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
