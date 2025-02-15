const express = require("express");
const {
  registerUser,
  getUserProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.get("/me", protect, getUserProfile);
// router.put("/update-profile", protect, updateProfile);

module.exports = router;
