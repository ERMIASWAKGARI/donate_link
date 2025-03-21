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
} = require('../controllers/userController');
const uploadVerificationDocsMiddleware = require('../middleware/fileUpload');
const uploadProfilePictureMiddleware = require('../middleware/uploadProfilePicture');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post(
  '/upload-profile-picture',
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
router.post(
  '/upload-verification-docs',
  protect,
  uploadVerificationDocsMiddleware,
  uploadVerificationDocs
);

module.exports = router;
