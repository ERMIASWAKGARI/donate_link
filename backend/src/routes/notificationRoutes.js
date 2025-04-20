const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = require("../controllers/notificationController");

router.get("/", protect, getNotifications);
router.patch("/:id/read", protect, markAsRead);
router.patch("/read-all", protect, markAllAsRead);

router.delete("/delete", protect, clearNotifications);

module.exports = router;
