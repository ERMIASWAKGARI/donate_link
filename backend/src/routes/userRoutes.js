const express = require('express');

const {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deactivateAccount,
  deleteUserAccount,
  uploadVerificationDocs,
  uploadProfilePicture,
  softDeleteUserAccount,
  reactivateAccount,
  recoverAccount,
  getUserById,
  getUserPaymentHistory,
  getUserMaterialHistory,
  getUserServiceHistory,
} = require('../controllers/userController');
const uploadVerificationDocsMiddleware = require('../middleware/fileUpload');
const uploadProfilePictureMiddleware = require('../middleware/uploadProfilePicture');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.patch(
  '/me/upload-profile-picture',
  protect,
  uploadProfilePictureMiddleware,
  uploadProfilePicture
);
router.get('/me', protect, getUserProfile);
router.patch('/me/update', protect, updateUserProfile);
router.patch('/me/deactivate', protect, deactivateAccount);
router.patch('/me/reactivate', reactivateAccount);
router.delete('/me/soft-delete', protect, softDeleteUserAccount);
router.patch('/me/recover-account', recoverAccount);
router.delete('/me/delete', protect, deleteUserAccount);
router.patch(
  '/me/upload-verification-docs',
  protect,
  uploadVerificationDocsMiddleware,
  uploadVerificationDocs
);
router.get('/:id', protect, getUserById);

router.get('/payment/:userId', getUserPaymentHistory);
router.get('/material/:userId', getUserMaterialHistory);
router.get('/service/:userId', getUserServiceHistory);

module.exports = router;
