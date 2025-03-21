const express = require('express');
const { protect, adminProtect } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  getUserById,
  verifyUser,
  rejectUserVerification,
  banUser,
  unbanUser,
  deleteUser,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/users', protect, adminProtect, getAllUsers);
router.get('/users/:id', protect, adminProtect, getUserById);
router.patch('/users/:id', protect, adminProtect, verifyUser);
router.patch(
  '/users/:id/reject-verification',
  protect,
  adminProtect,
  rejectUserVerification
);

router.patch('/users/:id/ban', protect, adminProtect, banUser);
router.delete('/users/:id', protect, adminProtect, deleteUser);

module.exports = router;
