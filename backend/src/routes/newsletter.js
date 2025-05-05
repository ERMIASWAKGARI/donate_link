const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  createNewsletter,
  sendNewsletter,

  getNewsletters,

  deleteNewsletter,
  getNewsletterById,
  updateNewsletter,
  createAndSendNewsletter,
} = require("../controllers/newsletterController");

// Admin-protected routes
router.use(protect);

router.route("/").post(createNewsletter);
router.route("/").get(getNewsletters);
router.delete("/:id", deleteNewsletter);

router.route("/:id/send").post(sendNewsletter);
router.get("/:id", getNewsletterById);
router.put("/:id", updateNewsletter);
router.post("/create-and-send", createAndSendNewsletter);

module.exports = router;
