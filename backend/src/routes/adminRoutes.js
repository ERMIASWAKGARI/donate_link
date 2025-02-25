const express = require("express");
const { protect, adminProtect } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getUserById,
  banUser, // <-- Ensure this is imported
  deleteUser,
} = require("../controllers/adminController"); // <-- Ensure this is correct

const router = express.Router();

router.get("/users", protect, adminProtect, getAllUsers);
router.get("/users/:id", protect, adminProtect, getUserById);
router.patch("/users/:id/ban", protect, adminProtect, banUser); // <-- Ensure this is correct
router.delete("/users/:id", protect, adminProtect, deleteUser);

module.exports = router;
