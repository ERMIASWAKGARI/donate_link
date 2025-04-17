const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  clearNotifications,
} = require("../controllers/notificationController");

const { protect, restrictTo } = require("../middleware/authMiddleware");

router.use(protect);

// Routes
router.get("/", getNotifications);
router.patch("/mark-all-read", markAllAsRead);
router.patch("/:id", markNotificationAsRead);

router.delete("/delete", clearNotifications);

module.exports = router;
