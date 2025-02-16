const express = require("express");
const {
  registerUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.get("/me", protect, getUserProfile);
router.patch("/update-profile", protect, updateUserProfile);

module.exports = router;
