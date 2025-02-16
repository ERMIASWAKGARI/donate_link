const express = require("express");
const {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deactivateAccount,
  reactivateAccount,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.get("/me", protect, getUserProfile);
router.patch("/update-profile", protect, updateUserProfile);
router.delete("/me/deactivate", protect, deactivateAccount);
router.post("/me/reactivate", reactivateAccount);

module.exports = router;
