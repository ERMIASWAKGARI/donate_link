const express = require("express");
const {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deactivateAccount,
  reactivateAccount,
  deleteUserAccount,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.get("/me", protect, getUserProfile);
router.patch("/me/update", protect, updateUserProfile);
router.delete("/me/deactivate", protect, deactivateAccount);
router.post("/me/reactivate", reactivateAccount);
router.delete("/me/delete", protect, deleteUserAccount);

module.exports = router;
