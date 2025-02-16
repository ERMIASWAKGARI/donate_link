const express = require("express");
const {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deactivateAccount,
  reactivateAccount,
  deleteUserAccount,
  uploadVerificationDocs,
  uploadProfilePicture,
} = require("../controllers/userController");
const upload = require("../middleware/fileUpload");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post(
  "/upload-profile-picture",
  protect,
  upload.single("profilePicture"),
  uploadProfilePicture
);
router.get("/me", protect, getUserProfile);
router.patch("/me/update", protect, updateUserProfile);
router.delete("/me/deactivate", protect, deactivateAccount);
router.post("/me/reactivate", reactivateAccount);
router.delete("/me/delete", protect, deleteUserAccount);

router.post(
  "/upload",
  protect,
  upload.array("documents", 5),
  uploadVerificationDocs
);

module.exports = router;
