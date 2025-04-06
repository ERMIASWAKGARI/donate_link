const express = require('express');
const { protect, adminProtect } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  getUserById,
  verifyUser,
  getVerificationDocuments,
  rejectUserVerification,
  banUser,
  bulkBanUsers,
  bulkUnbanUsers,
  unbanUser,
  deleteUser,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/users', protect, adminProtect, getAllUsers);
router.patch('/users/bulk-ban', protect, adminProtect, bulkBanUsers);
router.patch('/users/bulk-unban', protect, adminProtect, bulkUnbanUsers);
router.patch('/users/bulk-ban', bulkBanUsers);
router.get('/users/:id', protect, adminProtect, getUserById);
router.patch('/users/:id', protect, adminProtect, verifyUser);
router.get(
  '/users/:id/verification-docs',
  protect,
  adminProtect,
  getVerificationDocuments
);

router.patch(
  '/users/:id/reject-verification',
  protect,
  adminProtect,
  rejectUserVerification
);

router.patch('/users/:id/ban', protect, adminProtect, banUser);
router.patch('/users/:id/unban', protect, adminProtect, unbanUser);

router.delete('/users/:id', protect, adminProtect, deleteUser);

module.exports = router;
